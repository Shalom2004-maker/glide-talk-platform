import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, X, Loader2 } from "lucide-react";
import { ConversationWithDetails, MessageWithReactions } from "@/lib/chatService";
import { useMessages, useSendMessage, useMarkAsRead, useAddReaction, useRemoveReaction, useUploadAttachment } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";

interface ChatAreaProps {
  conversation: ConversationWithDetails;
  currentUserId: string;
  onToggleProfile: () => void;
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

function formatLastSeen(lastSeen: string | null) {
  if (!lastSeen) return "Offline";
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Last seen just now";
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Last seen ${days}d ago`;
}

function Avatar({ src, name, className = "w-9 h-9 text-xs" }: { src: string | null; name: string | null; className?: string }) {
  if (src) {
    return <img src={src} alt={name || "avatar"} className={`rounded-full object-cover ${className}`} referrerPolicy="no-referrer" />;
  }
  return (
    <div className={`rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold ${className}`}>
      {getInitials(name)}
    </div>
  );
}

export function ChatArea({ conversation, currentUserId, onToggleProfile }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const other = getOtherParticipant(conversation, currentUserId);
  const otherProfile = other?.profile;

  const { data: messages = [] } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const uploadAttachment = useUploadAttachment();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pickedFile]);

  useEffect(() => {
    if (conversation.id) {
      markAsRead.mutate(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  const handleSend = (content: string) => {
    const text = content.trim();
    if (!text && !pickedFile) return;

    if (pickedFile) {
      uploadAttachment.mutate(pickedFile, {
        onSuccess: (data) => {
          sendMessage.mutate({
            conversationId: conversation.id,
            content: text || "📎 Attachment",
            attachment: { ...data, type: pickedFile.type },
          });
          setPickedFile(null);
        },
        onError: () => {
          setPickedFile(null);
        },
      });
    } else {
      sendMessage.mutate({ conversationId: conversation.id, content: text });
      setInput("");
      setShowEmoji(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPickedFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const emojis = ["😀", "😂", "❤️", "👍", "🔥", "🎉", "😊", "🙏", "💯", "✨", "😍", "🤔"];

  const currentUserReaction = (msg: MessageWithReactions, emoji: string) =>
    msg.reactions?.find((r) => r.user_id === currentUserId && r.emoji === emoji);

  const handleReact = (msg: MessageWithReactions, emoji: string) => {
    if (currentUserReaction(msg, emoji)) {
      removeReaction.mutate({ messageId: msg.id, emoji });
    } else {
      addReaction.mutate({ messageId: msg.id, emoji });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 glass-panel flex-shrink-0">
        <button onClick={onToggleProfile} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Avatar src={otherProfile?.avatar_url || null} name={otherProfile?.display_name || null} />
            {otherProfile?.is_online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-online border-2 border-card" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{otherProfile?.display_name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {otherProfile?.is_online
                ? "Online"
                : otherProfile?.status_message || formatLastSeen(otherProfile?.last_seen || null)}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Call">
            <Phone className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Video">
            <Video className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={onToggleProfile} className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="More">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId;
          const prev = messages[i - 1];
          const showAvatar = i === 0 || prev?.sender_id !== msg.sender_id;
          const senderIsOther = !isMe;
          const senderAvatar = senderIsOther ? otherProfile?.avatar_url || null : null;

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={isMe}
              showAvatar={showAvatar}
              senderAvatar={senderAvatar}
              onReact={(emoji) => handleReact(msg, emoji)}
            />
          );
        })}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 pb-2 animate-fade-in">
          <div className="glass-panel rounded-2xl p-3 flex flex-wrap gap-2">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => setInput((v) => v + e)}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/50 flex-shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        {pickedFile && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-muted animate-fade-in">
            <FileIcon file={pickedFile} />
            <span className="text-xs text-foreground truncate flex-1">{pickedFile.name}</span>
            <button onClick={() => setPickedFile(null)} className="p-1 hover:bg-border rounded" aria-label="Remove attachment">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-2.5 rounded-xl transition-colors ${showEmoji ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}
            aria-label="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground" aria-label="Attach">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={(!input.trim() && !pickedFile) || sendMessage.isPending || uploadAttachment.isPending}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            {uploadAttachment.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function FileIcon({ file }: { file: File }) {
  const isImage = file.type.startsWith("image/");
  if (isImage) {
    return (
      <img
        src={URL.createObjectURL(file)}
        alt="preview"
        className="w-6 h-6 rounded object-cover"
      />
    );
  }
  return <Paperclip className="w-4 h-4 text-muted-foreground" />;
}
