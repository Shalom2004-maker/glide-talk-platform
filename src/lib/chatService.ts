import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type ParticipantRow = Database["public"]["Tables"]["conversation_participants"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ReactionRow = Database["public"]["Tables"]["message_reactions"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type { ProfileRow };

export interface ConversationWithDetails extends ConversationRow {
  participants: (ParticipantRow & { profile: ProfileRow })[];
  last_message: MessageRow | null;
  unread_count: number;
}

export interface MessageWithReactions extends MessageRow {
  reactions: ReactionRow[];
  sender_profile: ProfileRow;
}

export async function getUserConversations(userId: string): Promise<ConversationWithDetails[]> {
  const { data: participations, error: partError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (partError) throw partError;
  if (!participations?.length) return [];

  const convIds = participations.map((p) => p.conversation_id);

  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .in("id", convIds)
    .order("updated_at", { ascending: false });

  if (convError) throw convError;

  const results: ConversationWithDetails[] = [];

  for (const conv of conversations || []) {
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("*")
      .eq("conversation_id", conv.id);

    const profiles: (ParticipantRow & { profile: ProfileRow })[] = [];
    for (const p of parts || []) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", p.user_id)
        .single();
      if (prof) profiles.push({ ...p, profile: prof });
    }

    const { data: lastMsg } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { count: unread } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conv.id)
      .neq("sender_id", userId)
      .is("read_at", null);

    results.push({
      ...conv,
      participants: profiles,
      last_message: lastMsg,
      unread_count: unread || 0,
    });
  }

  return results;
}

export async function getConversationMessages(
  conversationId: string
): Promise<MessageWithReactions[]> {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const results: MessageWithReactions[] = [];

  for (const msg of messages || []) {
    const { data: reactions } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("message_id", msg.id);

    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", msg.sender_id)
      .single();

    results.push({
      ...msg,
      reactions: reactions || [],
      sender_profile: senderProfile || {
        id: "",
        user_id: msg.sender_id,
        display_name: "Unknown",
        avatar_url: null,
        bio: null,
        status_message: null,
        is_online: false,
        last_seen: null,
        created_at: "",
        updated_at: "",
      },
    });
  }

  return results;
}

export type MessageInsert = {
  conversationId: string;
  senderId: string;
  content: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
    size: number;
  } | null;
};

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachment?: MessageInsert["attachment"]
): Promise<MessageRow> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      attachment_name: attachment?.name ?? null,
      attachment_url: attachment?.url ?? null,
      attachment_type: attachment?.type ?? null,
      attachment_size: attachment?.size ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadAttachment(file: File, userId: string): Promise<{ url: string; name: string; size: number }> {
  const ext = file.name.split(".").pop() || "file";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("chat-attachments")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("chat-attachments")
    .getPublicUrl(path);

  return {
    url: publicUrl.publicUrl,
    name: file.name,
    size: file.size,
  };
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
}

export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const { error } = await supabase
    .from("message_reactions")
    .insert({ message_id: messageId, user_id: userId, emoji });
  if (error && error.code !== "23505") throw error;
}

export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .eq("emoji", emoji);
  if (error) throw error;
}

export async function findOrCreateConversation(
  otherUserId: string
): Promise<string> {
  const { data, error } = await supabase.rpc("find_or_create_conversation", {
    other_user_id: otherUserId,
  });
  if (error) throw error;
  return data;
}

export async function searchProfiles(query: string): Promise<ProfileRow[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("display_name", `%${trimmed}%`)
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function setPresenceOnline(): Promise<void> {
  await supabase.rpc("user_online");
}

export async function setPresenceOffline(): Promise<void> {
  await supabase.rpc("user_offline");
}

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string }> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  const avatarUrl = publicUrl.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("user_id", userId);

  if (updateError) throw updateError;

  return { url: avatarUrl };
}
