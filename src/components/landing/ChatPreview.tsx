import { Send, Smile, Paperclip, MoreVertical } from "lucide-react";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { ConversationWithDetails, MessageWithReactions, ProfileRow } from "@/lib/chatService";

const ts = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();

function makeProfile(userId: string, displayName: string, isOnline: boolean): ProfileRow {
  return {
    id: userId,
    user_id: userId,
    display_name: displayName,
    avatar_url: null,
    bio: null,
    status_message: null,
    is_online: isOnline,
    last_seen: isOnline ? null : ts(120),
    is_admin: false,
    is_banned: false,
    is_verified: false,
    deleted_at: null,
    created_at: ts(60 * 24 * 30),
    updated_at: ts(60),
  };
}

const meProfile = makeProfile("me", "Alex Rivera", true);
const priyaProfile = makeProfile("priya", "Priya Sharma", true);
const marcusProfile = makeProfile("marcus", "Marcus Chen", true);
const lenaProfile = makeProfile("lena", "Lena Fischer", false);

interface MessageSeed {
  id: string;
  senderId: string;
  content: string;
  createdAt: number;
  readAt?: boolean;
  reactions?: MessageWithReactions["reactions"];
  attachment?: { name: string; url: string; type: string; size: number };
}

function makeMessage(seed: MessageSeed, senderProfile: ProfileRow): MessageWithReactions {
  return {
    id: seed.id,
    conversation_id: "conv-priya",
    sender_id: seed.senderId,
    content: seed.content,
    created_at: ts(seed.createdAt),
    read_at: seed.readAt ? ts(seed.createdAt - 1) : null,
    attachment_name: seed.attachment?.name ?? null,
    attachment_size: seed.attachment?.size ?? null,
    attachment_type: seed.attachment?.type ?? null,
    attachment_url: seed.attachment?.url ?? null,
    reactions: seed.reactions ?? [],
    sender_profile: senderProfile,
  };
}

const messages: MessageWithReactions[] = [
  makeMessage(
    {
      id: "m1",
      senderId: "priya",
      content: "Hey! Did you get a look at the notes I sent over?",
      createdAt: 30,
      readAt: true,
    },
    priyaProfile
  ),
  makeMessage(
    {
      id: "m2",
      senderId: "me",
      content: "Just read through them — the feedback on the timeline is exactly what I needed.",
      createdAt: 25,
      readAt: true,
    },
    meProfile
  ),
  makeMessage(
    {
      id: "m3",
      senderId: "priya",
      content: "Great, that part had me stuck too. Let's circle back tomorrow after the sync.",
      createdAt: 20,
      readAt: true,
      reactions: [
        { id: "r1", message_id: "m3", user_id: "me", emoji: "👍", created_at: ts(12) },
      ],
    },
    priyaProfile
  ),
  makeMessage(
    {
      id: "m4",
      senderId: "me",
      content: "📎 Attachment",
      createdAt: 10,
      readAt: true,
      attachment: {
        name: "design-spec.pdf",
        url: "/placeholder.svg",
        type: "application/pdf",
        size: 24576,
      },
    },
    meProfile
  ),
  makeMessage(
    {
      id: "m5",
      senderId: "priya",
      content: "Perfect — I'll review it and have notes back before our call.",
      createdAt: 4,
    },
    priyaProfile
  ),
];

const conversations: ConversationWithDetails[] = [
  {
    id: "conv-priya",
    created_at: ts(60 * 24 * 30),
    updated_at: ts(4),
    participants: [
      { id: "p1", conversation_id: "conv-priya", user_id: "me", joined_at: ts(60 * 24 * 30), profile: meProfile },
      { id: "p2", conversation_id: "conv-priya", user_id: "priya", joined_at: ts(60 * 24 * 30), profile: priyaProfile },
    ],
    last_message: messages[messages.length - 1],
    unread_count: 1,
  },
  {
    id: "conv-marcus",
    created_at: ts(60 * 24 * 20),
    updated_at: ts(45),
    participants: [
      { id: "p3", conversation_id: "conv-marcus", user_id: "me", joined_at: ts(60 * 24 * 20), profile: meProfile },
      { id: "p4", conversation_id: "conv-marcus", user_id: "marcus", joined_at: ts(60 * 24 * 20), profile: marcusProfile },
    ],
    last_message: {
      id: "cm1",
      conversation_id: "conv-marcus",
      sender_id: "marcus",
      content: "haha, exactly what I was about to say 😄",
      created_at: ts(45),
      read_at: null,
      attachment_name: null,
      attachment_size: null,
      attachment_type: null,
      attachment_url: null,
    },
    unread_count: 0,
  },
  {
    id: "conv-lena",
    created_at: ts(60 * 24 * 10),
    updated_at: ts(60 * 26),
    participants: [
      { id: "p5", conversation_id: "conv-lena", user_id: "me", joined_at: ts(60 * 24 * 10), profile: meProfile },
      { id: "p6", conversation_id: "conv-lena", user_id: "lena", joined_at: ts(60 * 24 * 10), profile: lenaProfile },
    ],
    last_message: {
      id: "cl1",
      conversation_id: "conv-lena",
      sender_id: "lena",
      content: "See you tomorrow — I'll bring the drafts!",
      created_at: ts(60 * 26),
      read_at: null,
      attachment_name: null,
      attachment_size: null,
      attachment_type: null,
      attachment_url: null,
    },
    unread_count: 3,
  },
];

export function ChatPreview() {
  const noop = () => {};

  return (
    <div className="glass-panel rounded-2xl border border-border/50 shadow-2xl overflow-hidden bg-card/70">
      {/* Window header */}
      <div className="h-10 sm:h-11 flex items-center justify-between px-3 sm:px-4 border-b border-border/50">
        <span className="text-base sm:text-lg font-bold tracking-tight">
          <span className="text-primary">Let</span>
          <span className="text-foreground">Chat</span>
          <span className="text-primary">.</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-online opacity-60" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-online" />
          </span>
          Real-time
        </span>
      </div>

      <div className="flex h-[340px] sm:h-[420px]">
        {/* Conversation sidebar */}
        <div className="hidden md:block w-56 lg:w-64 border-r border-border/50">
          <ConversationList
            conversations={conversations}
            activeId="conv-priya"
            currentUserId="me"
            onSelect={noop}
          />
        </div>

        {/* Chat window */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Chat header */}
          <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 border-b border-border/50 flex-shrink-0">
            <button className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-left cursor-default">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  PS
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-online border-2 border-card" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Priya Sharma</p>
                <p className="text-xs text-muted-foreground truncate">Online</p>
              </div>
            </button>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <button className="p-2 rounded-xl text-muted-foreground cursor-default" aria-label="More options">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden p-3 sm:p-4 relative">
            <div className="space-y-1 h-full overflow-hidden">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === "me";
                const prev = messages[i - 1];
                const showAvatar = i === 0 || prev?.sender_id !== msg.sender_id;
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={isMe}
                    showAvatar={showAvatar}
                    senderAvatar={null}
                    onReact={noop}
                  />
                );
              })}
              <TypingIndicator name="Priya Sharma" />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Composer */}
          <div className="p-2 sm:p-3 border-t border-border/50 flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground">
                <Smile className="w-5 h-5" />
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground">
                <Paperclip className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 h-9 rounded-2xl bg-muted px-3.5 flex items-center text-sm text-muted-foreground">
                Type a message...
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}