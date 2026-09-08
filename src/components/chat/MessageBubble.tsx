import { useState } from "react";
import { Check, CheckCheck, FileText, Download } from "lucide-react";
import { MessageWithReactions } from "@/lib/chatService";

interface MessageBubbleProps {
  message: MessageWithReactions;
  isMe: boolean;
  showAvatar: boolean;
  senderAvatar: string | null;
  onReact: (emoji: string) => void;
}

const quickReactions = ["❤️", "👍", "😂", "😮", "😢"];

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, isMe, showAvatar, senderAvatar, onReact }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  const dominantReaction = message.reactions?.[0]?.emoji;
  const isImage = message.attachment_type?.startsWith("image/");

  return (
    <div
      className={`flex items-end gap-2 animate-bubble-in ${isMe ? "flex-row-reverse" : ""} ${showAvatar ? "mt-3" : "mt-0.5"}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      <div className="w-7 flex-shrink-0">
        {showAvatar && !isMe && (
          senderAvatar ? (
            <img src={senderAvatar} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
              ?
            </div>
          )
        )}
      </div>

      <div className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] group`}>
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed ${
            isMe
              ? "bg-bubble-sender text-bubble-sender-foreground rounded-2xl rounded-br-md"
              : "bg-bubble-receiver text-bubble-receiver-foreground rounded-2xl rounded-bl-md"
          }`}
        >
          {/* Image attachment */}
          {message.attachment_url && isImage && (
            <a href={message.attachment_url} target="_blank" rel="noreferrer" className="block mb-2 -mx-1">
              <img
                src={message.attachment_url}
                alt={message.attachment_name || "Image"}
                className="rounded-lg max-h-64 w-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </a>
          )}

          {/* File attachment (non-image) */}
          {message.attachment_url && !isImage && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 mb-2 not-prose"
            >
              <FileText className="w-5 h-5 flex-shrink-0 opacity-70" />
              <span className="text-xs truncate max-w-[180px]">{message.attachment_name || "File"}</span>
              <Download className="w-4 h-4 flex-shrink-0 opacity-60" />
            </a>
          )}

          {/* Text content */}
          {message.content && message.content !== "📎 Attachment" && (
            <>{message.content}</>
          )}

          <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
            <span className="text-[10px] opacity-50">{formatTime(message.created_at)}</span>
            {isMe && (
              message.read_at
                ? <CheckCheck className="w-3 h-3 text-primary opacity-70" />
                : <Check className="w-3 h-3 opacity-40" />
            )}
          </div>
        </div>

        {/* Reaction badge */}
        {dominantReaction && (
          <button
            onClick={() => onReact(dominantReaction)}
            className={`absolute -bottom-2 ${isMe ? "left-1" : "right-1"} bg-card border border-border rounded-full px-1.5 py-0.5 text-xs shadow-sm hover:scale-110 transition-transform`}
          >
            {dominantReaction}
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
