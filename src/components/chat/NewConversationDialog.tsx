import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { searchProfiles } from "@/lib/chatService";
import { useStartConversation } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import type { ProfileRow } from "@/lib/chatService";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  onConversationStarted: (conversationId: string) => void;
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

export function NewConversationDialog({
  open,
  onOpenChange,
  currentUserId,
  onConversationStarted,
}: NewConversationDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const startConversation = useStartConversation();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSearched(false);
      setError("");
    }
  }, [open]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchProfiles(query.trim());
      setResults(res.filter((p) => p.user_id !== currentUserId));
      setSearched(true);
    } catch (e) {
      console.error(e);
      setResults([]);
      setSearched(false);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (userId: string) => {
    try {
      const convId = await startConversation.mutateAsync(userId);
      onOpenChange(false);
      onConversationStarted(convId);
    } catch (e) {
      console.error(e);
      toast({
        title: "Could not start conversation",
        description: e instanceof Error ? e.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Search for a user to start chatting with.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
              setSearched(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="mt-2 space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
          {loading && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-destructive py-6">{error}</p>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No users found</p>
          )}

          {!loading &&
            results.map((profile) => (
              <button
                key={profile.user_id}
                onClick={() => handleSelect(profile.user_id)}
                disabled={startConversation.isPending}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {getInitials(profile.display_name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile.display_name || "Unknown"}
                  </p>
                  {profile.status_message && (
                    <p className="text-xs text-muted-foreground truncate">{profile.status_message}</p>
                  )}
                </div>
              </button>
            ))}

          {!loading && !searched && results.length === 0 && query.trim() === "" && (
            <p className="text-center text-sm text-muted-foreground py-6">
              Type a name above and press Enter to search.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
