import { useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { Message } from "@/lib/mockData";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  contactAvatar: string;
  onReact: (emoji: string) => void;
}

const quickReactions = ["❤️", "👍", "😂", "😮", "😢"];

export function MessageBubble({ message, isMe, showAvatar, contactAvatar, onReact }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div
      className={`flex items-end gap-2 animate-bubble-in ${isMe ? "flex-row-reverse" : ""} ${showAvatar ? "mt-3" : "mt-0.5"}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      <div className="w-7 flex-shrink-0">
        {showAvatar && !isMe && (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
            {contactAvatar}
          </div>
        )}
      </div>

      <div className={`relative max-w-[75%] md:max-w-[60%] group`}>
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed ${
            isMe
              ? "bg-bubble-sender text-bubble-sender-foreground rounded-2xl rounded-br-md"
              : "bg-bubble-receiver text-bubble-receiver-foreground rounded-2xl rounded-bl-md"
          }`}
        >
          {message.text}
          <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
            <span className="text-[10px] opacity-50">{message.timestamp}</span>
            {isMe && (
              message.read
                ? <CheckCheck className="w-3 h-3 text-primary opacity-70" />
                : <Check className="w-3 h-3 opacity-40" />
            )}
          </div>
        </div>

        {/* Reaction badge */}
        {message.reaction && (
          <button
            onClick={() => onReact(message.reaction!)}
            className={`absolute -bottom-2 ${isMe ? "left-1" : "right-1"} bg-card border border-border rounded-full px-1.5 py-0.5 text-xs shadow-sm hover:scale-110 transition-transform`}
          >
            {message.reaction}
          </button>
        )}

        {/* Quick reactions popup */}
        {showReactions && (
          <div
            className={`absolute -top-8 ${isMe ? "right-0" : "left-0"} flex items-center gap-0.5 bg-card border border-border rounded-full px-1.5 py-1 shadow-lg animate-fade-in z-10`}
          >
            {quickReactions.map((e) => (
              <button
                key={e}
                onClick={() => onReact(e)}
                className="text-sm hover:scale-125 transition-transform p-0.5"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
