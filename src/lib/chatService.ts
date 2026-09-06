import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type ParticipantRow = Database["public"]["Tables"]["conversation_participants"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ReactionRow = Database["public"]["Tables"]["message_reactions"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface JoinedParticipant extends ParticipantRow {
  profiles: ProfileRow | null;
}

interface JoinedConversation extends ConversationRow {
  conversation_participants: JoinedParticipant[];
}

interface JoinedMessage extends Omit<MessageRow, "sender"> {
  message_reactions: ReactionRow[];
  sender: ProfileRow | null;
}

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
    .select(`
      *,
      conversation_participants (
        *,
        profiles:user_id (*)
      )
    `)
    .in("id", convIds)
    .order("updated_at", { ascending: false });

  if (convError) throw convError;

  const { data: lastMessages } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  const lastMsgByConv = new Map<string, MessageRow>();
  for (const msg of lastMessages || []) {
    if (!lastMsgByConv.has(msg.conversation_id)) {
      lastMsgByConv.set(msg.conversation_id, msg);
    }
  }

  const unreadCounts = new Map<string, number>();
  for (const convId of convIds) {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", convId)
      .neq("sender_id", userId)
      .is("read_at", null);
    unreadCounts.set(convId, count || 0);
  }

  const results: ConversationWithDetails[] = (conversations || []).map((conv: JoinedConversation) => ({
    ...conv,
    participants: (conv.conversation_participants || []).map((p) => ({
      ...p,
      profile: p.profiles,
    })),
    last_message: lastMsgByConv.get(conv.id) || null,
    unread_count: unreadCounts.get(conv.id) || 0,
  }));

  return results;
}

export async function getConversationMessages(
  conversationId: string
): Promise<MessageWithReactions[]> {
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      message_reactions (*),
      sender:sender_id (*)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (messages || []).map((msg: JoinedMessage) => ({
    ...msg,
    reactions: msg.message_reactions || [],
    sender_profile: msg.sender || {
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
  }));
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

// ============================================================
// ADMIN
// ============================================================

export async function getAdminStats(): Promise<{
  totalUsers: number;
  onlineUsers: number;
  totalConversations: number;
  totalMessages: number;
  bannedUsers: number;
  messagesToday: number;
}> {
  const [
    { count: totalUsers },
    { count: onlineUsers },
    { count: totalConversations },
    { count: totalMessages },
    { count: bannedUsers },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true)
      .is("deleted_at", null),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_banned", true),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: messagesToday } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  return {
    totalUsers: totalUsers || 0,
    onlineUsers: onlineUsers || 0,
    totalConversations: totalConversations || 0,
    totalMessages: totalMessages || 0,
    bannedUsers: bannedUsers || 0,
    messagesToday: messagesToday || 0,
  };
}

export async function getAllUsers(
  search: string = ""
): Promise<ProfileRow[]> {
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.ilike("display_name", `%${search.trim()}%`);
  }

  const { data, error } = await query.limit(200);
  if (error) throw error;
  return data || [];
}

export async function setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function setUserBanned(userId: string, isBanned: boolean): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: isBanned })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function setUserVerified(userId: string, isVerified: boolean): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_verified: isVerified })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);
  if (error) throw error;
}

export async function getRecentMessages(limit = 50): Promise<MessageWithReactions[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id (*)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((msg: JoinedMessage) => ({
    ...msg,
    reactions: [],
    sender_profile: msg.sender || {
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
  }));
}

// ============================================================
// MUTE & BLOCK
// ============================================================

export async function isConversationMuted(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("conversation_mutes")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function setConversationMuted(
  conversationId: string,
  userId: string,
  muted: boolean
): Promise<void> {
  if (muted) {
    const { error } = await supabase
      .from("conversation_mutes")
      .upsert({ conversation_id: conversationId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("conversation_mutes")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (error) throw error;
  }
}

export async function getBlockStatus(
  currentUserId: string,
  otherUserId: string
): Promise<{ blockedByMe: boolean; blockedMe: boolean }> {
  const { data: mine } = await supabase
    .from("user_blocks")
    .select("id")
    .eq("blocker_id", currentUserId)
    .eq("blocked_id", otherUserId)
    .maybeSingle();

  const { data: theirs } = await supabase
    .from("user_blocks")
    .select("id")
    .eq("blocker_id", otherUserId)
    .eq("blocked_id", currentUserId)
    .maybeSingle();

  return {
    blockedByMe: !!mine,
    blockedMe: !!theirs,
  };
}

export async function setUserBlocked(
  currentUserId: string,
  otherUserId: string,
  blocked: boolean
): Promise<void> {
  if (blocked) {
    const { error } = await supabase
      .from("user_blocks")
      .upsert({ blocker_id: currentUserId, blocked_id: otherUserId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", currentUserId)
      .eq("blocked_id", otherUserId);
    if (error) throw error;
  }
}
