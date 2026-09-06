import { X, BellOff, BellRing, Ban, ShieldOff } from "lucide-react";
import { ConversationWithDetails } from "@/lib/chatService";
import { useConversationMuted, useToggleMute, useBlockStatus, useToggleBlock } from "@/hooks/useChat";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ContactProfileProps {
  conversation: ConversationWithDetails;
  currentUserId: string;
  onClose: () => void;
}

function getOtherParticipant(conv: ConversationWithDetails, currentUserId: string) {
  return conv.participants.find((p) => p.user_id !== currentUserId);
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ContactProfile({ conversation, currentUserId, onClose }: ContactProfileProps) {
  const { toast } = useToast();
  const other = getOtherParticipant(conversation, currentUserId);
  const profile = other?.profile;
  const otherUserId = other?.user_id || "";

  const { data: muted = false } = useConversationMuted(conversation.id);
  const toggleMute = useToggleMute(conversation.id);
  const { data: blockStatus } = useBlockStatus(otherUserId);
  const toggleBlock = useToggleBlock(otherUserId);
  const [confirmUnblock, setConfirmUnblock] = useState(false);

  const handleToggleBlock = (block: boolean) => {
    if (block) {
      toggleBlock.mutate(true);
      toast({ title: "Contact blocked", description: `${profile?.display_name || "User"} will no longer be able to message you.` });
    } else {
      setConfirmUnblock(true);
    }
  };

  return (
    <div className="h-full flex flex-col glass-panel animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Contact Info</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || "avatar"}
              className="w-20 h-20 rounded-full object-cover mb-3"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-3">
              {getInitials(profile?.display_name || null)}
            </div>
          )}
          <h4 className="text-lg font-semibold text-foreground">{profile?.display_name || "Unknown"}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${profile?.is_online ? "bg-online" : "bg-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground capitalize">
              {profile?.is_online ? "Online" : "Offline"}
            </span>
          </div>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
          )}
          {profile?.status_message && (
            <span className="text-xs text-muted-foreground mt-2 italic">"{profile.status_message}"</span>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-sm text-foreground"
            onClick={() => toggleMute.mutate(!muted)}
            disabled={toggleMute.isPending}
          >
            {muted ? <BellRing className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
            {muted ? "Unmute notifications" : "Mute notifications"}
          </button>

          {blockStatus?.blockedMe ? (
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-sm text-destructive cursor-not-allowed"
              disabled
            >
              <Ban className="w-4 h-4" />
              You've been blocked by this contact
            </button>
          ) : blockStatus?.blockedByMe ? (
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-sm text-destructive"
              onClick={() => handleToggleBlock(false)}
              disabled={toggleBlock.isPending}
            >
              <ShieldOff className="w-4 h-4" />
              Unblock contact
            </button>
          ) : (
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-sm text-destructive"
              onClick={() => handleToggleBlock(true)}
              disabled={toggleBlock.isPending}
            >
              <Ban className="w-4 h-4" />
              Block contact
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmUnblock} onOpenChange={setConfirmUnblock}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock contact?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be able to exchange messages with {profile?.display_name || "this contact"} again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toggleBlock.mutate(false);
                toast({ title: "Contact unblocked" });
              }}
            >
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
