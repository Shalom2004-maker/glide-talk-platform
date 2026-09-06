/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendMessage,
  markMessagesAsRead,
  addReaction,
  removeReaction,
  searchProfiles,
  isConversationMuted,
  setConversationMuted,
  getBlockStatus,
  setUserBlocked,
} from "@/lib/chatService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => {
  const chainable = (result: any) => {
    const method = () => chainable(result);
    return {
      then: undefined,
      eq: method,
      neq: method,
      is: method,
      ilike: method,
      order: method,
      limit: method,
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(result),
      maybeSingle: vi.fn().mockResolvedValue(result),
      rpc: vi.fn(),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn(),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "url" } }),
        }),
      },
    };
  };

  return {
    supabase: {
      from: vi.fn(),
      rpc: vi.fn(),
    },
  };
});

describe("sendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts a message with attachment fields", async () => {
    const data = { id: "m1", content: "hello" };
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    });
    (supabase.from as any).mockReturnValue({ insert: insertMock });

    const result = await sendMessage("c1", "u1", "hello", {
      name: "file.png",
      url: "https://x/y.png",
      type: "image/png",
      size: 100,
    });

    expect(result).toEqual(data);
    expect(insertMock).toHaveBeenCalledWith({
      conversation_id: "c1",
      sender_id: "u1",
      content: "hello",
      attachment_name: "file.png",
      attachment_url: "https://x/y.png",
      attachment_type: "image/png",
      attachment_size: 100,
    });
  });

  it("inserts a message with null attachments when none provided", async () => {
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "m1" }, error: null }),
      }),
    });
    (supabase.from as any).mockReturnValue({ insert: insertMock });

    await sendMessage("c1", "u1", "hi", null);

    expect(insertMock).toHaveBeenCalledWith({
      conversation_id: "c1",
      sender_id: "u1",
      content: "hi",
      attachment_name: null,
      attachment_url: null,
      attachment_type: null,
      attachment_size: null,
    });
  });

  it("throws when the insert errors", async () => {
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error("boom") }),
        }),
      }),
    });

    await expect(sendMessage("c1", "u1", "hi")).rejects.toThrow("boom");
  });
});

describe("markMessagesAsRead", () => {
  it("updates unread messages for the conversation", async () => {
    const updateMock = vi.fn().mockResolvedValue({ error: null });
    const chain = {
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      is: vi.fn().mockResolvedValue({ error: null }),
    };
    updateMock.mockReturnValue(chain);
    (supabase.from as any).mockReturnValue({ update: updateMock });

    await markMessagesAsRead("c1", "u1");

    expect(updateMock).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("conversation_id", "c1");
    expect(chain.neq).toHaveBeenCalledWith("sender_id", "u1");
    expect(chain.is).toHaveBeenCalledWith("read_at", null);
  });
});

describe("addReaction", () => {
  it("inserts a reaction", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert: insertMock });

    await addReaction("m1", "u1", "👍");

    expect(insertMock).toHaveBeenCalledWith({
      message_id: "m1",
      user_id: "u1",
      emoji: "👍",
    });
  });

  it("ignores duplicate-key errors but throws other errors", async () => {
    const insertMock = vi
      .fn()
      .mockResolvedValueOnce({ error: { code: "23505" } })
      .mockResolvedValueOnce({ error: new Error("other") });
    (supabase.from as any).mockReturnValue({ insert: insertMock });

    await expect(addReaction("m1", "u1", "👍")).resolves.toBeUndefined();
    await expect(addReaction("m1", "u1", "👍")).rejects.toThrow("other");
  });
});

describe("removeReaction", () => {
  it("deletes a reaction with all filters", async () => {
    const deleteMock = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockReturnThis();
    deleteMock.mockReturnValue({ eq });
    (supabase.from as any).mockReturnValue({ delete: deleteMock });

    await removeReaction("m1", "u1", "👍");

    expect(deleteMock).toHaveBeenCalled();
    expect(eq).toHaveBeenNthCalledWith(1, "message_id", "m1");
    expect(eq).toHaveBeenNthCalledWith(2, "user_id", "u1");
    expect(eq).toHaveBeenNthCalledWith(3, "emoji", "👍");
  });
});

describe("searchProfiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array for empty query", async () => {
    await expect(searchProfiles("   ")).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("searches profiles by display name", async () => {
    const data = [{ user_id: "u1", display_name: "Alice" }];
    const chain = {
      ilike: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data, error: null }),
    };
    (supabase.from as any).mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

    const result = await searchProfiles("ali");
    expect(result).toEqual(data);
    expect(chain.ilike).toHaveBeenCalledWith("display_name", "%ali%");
  });
});

describe("isConversationMuted / setConversationMuted", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true when a mute row exists", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id: "x" } }) }),
    });
    await expect(isConversationMuted("c1", "u1")).resolves.toBe(true);
  });

  it("returns false when no mute row exists", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null }) }),
    });
    await expect(isConversationMuted("c1", "u1")).resolves.toBe(false);
  });

  it("inserts a mute when muting", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ upsert: upsertMock });
    await setConversationMuted("c1", "u1", true);
    expect(upsertMock).toHaveBeenCalledWith({ conversation_id: "c1", user_id: "u1" });
  });

  it("deletes a mute when unmuting", async () => {
    const deleteMock = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockReturnThis();
    deleteMock.mockReturnValue({ eq });
    (supabase.from as any).mockReturnValue({ delete: deleteMock });
    await setConversationMuted("c1", "u1", false);
    expect(deleteMock).toHaveBeenCalled();
    expect(eq).toHaveBeenNthCalledWith(1, "conversation_id", "c1");
    expect(eq).toHaveBeenNthCalledWith(2, "user_id", "u1");
  });
});

describe("getBlockStatus / setUserBlocked", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports blocking in both directions", async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { id: "b1" } })
      .mockResolvedValueOnce({ data: null });
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis(), maybeSingle }),
    });

    const status = await getBlockStatus("me", "them");
    expect(status).toEqual({ blockedByMe: true, blockedMe: false });
  });

  it("inserts a block when blocking", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ upsert: upsertMock });
    await setUserBlocked("me", "them", true);
    expect(upsertMock).toHaveBeenCalledWith({
      blocker_id: "me",
      blocked_id: "them",
    });
  });
});
