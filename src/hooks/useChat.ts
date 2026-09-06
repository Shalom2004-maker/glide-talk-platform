import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  addReaction,
  removeReaction,
  searchProfiles,
  findOrCreateConversation,
  uploadAttachment,
  uploadAvatar,
  getAdminStats,
  getAllUsers,
  setUserAdmin,
  setUserBanned,
  setUserVerified,
  deleteUserProfile,
  deleteMessage,
  getRecentMessages,
  isConversationMuted,
  setConversationMuted,
  getBlockStatus,
  setUserBlocked,
} from "@/lib/chatService";

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => getUserConversations(user!.id),
    enabled: !!user,
    refetchInterval: 5000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getConversationMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      attachment,
    }: {
      conversationId: string;
      content: string;
      attachment?: {
        name: string;
        url: string;
        type: string;
        size: number;
      } | null;
    }) => sendMessage(conversationId, user!.id, content, attachment),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUploadAttachment() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(file, user!.id),
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (conversationId: string) =>
      markMessagesAsRead(conversationId, user!.id),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      addReaction(messageId, user!.id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      removeReaction(messageId, user!.id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useSearchProfiles() {
  return useQuery({
    queryKey: ["profiles-search"],
    queryFn: () => searchProfiles(""),
    enabled: false,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (otherUserId: string) => findOrCreateConversation(otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// ============================================================
// ADMIN
// ============================================================

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user!.id)
        .single();
      if (error) return false;
      return data?.is_admin ?? false;
    },
    enabled: !!user,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    refetchInterval: 30000,
  });
}

export function useAdminUsers(query: string = "") {
  return useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => getAllUsers(query),
  });
}

export function useAdminRecentMessages() {
  return useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => getRecentMessages(50),
    refetchInterval: 15000,
  });
}

export function useSetUserAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      setUserAdmin(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useSetUserBanned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      setUserBanned(userId, isBanned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useSetUserVerified() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isVerified }: { userId: string; isVerified: boolean }) =>
      setUserVerified(userId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUserProfile(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });
}

// ============================================================
// MUTE & BLOCK
// ============================================================

export function useConversationMuted(conversationId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversation-muted", conversationId, user?.id],
    queryFn: () => isConversationMuted(conversationId, user!.id),
    enabled: !!conversationId && !!user,
  });
}

export function useToggleMute(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (muted: boolean) => setConversationMuted(conversationId, user!.id, muted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-muted", conversationId] });
    },
  });
}

export function useBlockStatus(otherUserId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["block-status", otherUserId, user?.id],
    queryFn: () => getBlockStatus(user!.id, otherUserId),
    enabled: !!otherUserId && !!user,
  });
}

export function useToggleBlock(otherUserId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (blocked: boolean) => setUserBlocked(user!.id, otherUserId, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-status", otherUserId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
