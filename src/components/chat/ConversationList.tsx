import { useState } from "react";
import { Search } from "lucide-react";
import { Conversation } from "@/lib/mockData";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.contact.name.toLowerCase().includes(search.toLowerCase())
  );

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
          const lastMsg = conv.messages[conv.messages.length - 1];
          const isActive = conv.id === activeId;

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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {conv.contact.avatar}
                </div>
                {conv.contact.status === "online" && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-online border-2 border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium truncate ${isActive ? "text-foreground" : "text-foreground"}`}>
                    {conv.contact.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {lastMsg?.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate pr-2">
                    {conv.typing ? (
                      <span className="text-primary font-medium">typing...</span>
                    ) : (
                      lastMsg?.text
                    )}
                  </p>
                  {conv.unread > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
