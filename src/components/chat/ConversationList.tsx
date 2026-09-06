import { useState } from "react";
import { Search } from "lucide-react";
import { ConversationWithDetails } from "@/lib/chatService";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  activeId: string;
  currentUserId: string;
  onSelect: (id: string) => void;
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

function formatTime(timestamp: string | null | undefined) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 1440) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffMin < 10080) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationList({ conversations, activeId, currentUserId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    const other = getOtherParticipant(c, currentUserId);
    if (!other) return true;
    return (other.profile?.display_name || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2 space-y-0.5">
        {filtered.map((conv) => {
          const isActive = conv.id === activeId;
          const other = getOtherParticipant(conv, currentUserId);

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              <div className="relative flex-shrink-0">
                {other?.profile?.avatar_url ? (
                  <img
                    src={other.profile.avatar_url}
                    alt=""
                    className={`w-10 h-10 rounded-full object-cover ${isActive ? "ring-2 ring-primary/30" : ""}`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {getInitials(other?.profile?.display_name || null)}
                  </div>
                )}
                {other?.profile?.is_online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-online border-2 border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium truncate ${isActive ? "text-foreground" : "text-foreground"}`}>
                    {other?.profile?.display_name || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatTime(conv.last_message?.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate pr-2">
                    {conv.last_message?.content || "No messages yet"}
                  </p>
                  {conv.unread_count > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
