import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Phone, Video, MoreVertical } from "lucide-react";
import { Conversation, Message } from "@/lib/mockData";
import { TypingIndicator } from "./TypingIndicator";
import { MessageBubble } from "./MessageBubble";

interface ChatAreaProps {
  conversation: Conversation;
  onToggleProfile: () => void;
}

export function ChatArea({ conversation, onToggleProfile }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setShowEmoji(false);
  };

  const emojis = ["😀", "😂", "❤️", "👍", "🔥", "🎉", "😊", "🙏", "💯", "✨", "😍", "🤔"];

  const addReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m))
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 glass-panel flex-shrink-0">
        <button onClick={onToggleProfile} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
              {conversation.contact.avatar}
            </div>
            {conversation.contact.status === "online" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-online border-2 border-card" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{conversation.contact.name}</p>
            <p className="text-xs text-muted-foreground">
              {conversation.contact.status === "online"
                ? "Online"
                : `Last seen ${conversation.contact.lastSeen}`}
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
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={msg.senderId === "me"}
            showAvatar={i === 0 || messages[i - 1].senderId !== msg.senderId}
            contactAvatar={conversation.contact.avatar}
            onReact={(emoji) => addReaction(msg.id, emoji)}
          />
        ))}
        {conversation.typing && <TypingIndicator />}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-2.5 rounded-xl transition-colors ${showEmoji ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}
            aria-label="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground" aria-label="Attach">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
