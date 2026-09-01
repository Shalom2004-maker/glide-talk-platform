import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { NavBar } from "@/components/chat/NavBar";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatArea } from "@/components/chat/ChatArea";
import { ContactProfile } from "@/components/chat/ContactProfile";
import { NewConversationDialog } from "@/components/chat/NewConversationDialog";
import { useAuth } from "@/lib/auth";
import { useConversations } from "@/hooks/useChat";
import { useRealtimeMessages, useRealtimeConversations, usePresence } from "@/hooks/useRealtime";

const Index = () => {
  const { user } = useAuth();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);

  usePresence();

  const { data: conversations = [], isLoading } = useConversations();
  useRealtimeConversations();
  useRealtimeMessages(activeConvId);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <NavBar
        onMenuToggle={() => setShowSidebar(!showSidebar)}
        onNewConversation={() => setShowNewConversation(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-foreground/20 z-30 animate-fade-in"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Left sidebar - conversations */}
        <aside
          className={`${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-14 left-0 z-40 w-80 border-r border-border/50 bg-card transition-transform duration-300 lg:w-80 xl:w-[340px] flex-shrink-0`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeConv?.id || ""}
            currentUserId={user?.id || ""}
            onSelect={(id) => {
              setActiveConvId(id);
              setShowSidebar(false);
            }}
          />
        </aside>

        {/* Main chat */}
        <main className="flex-1 min-w-0 bg-background">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : activeConv ? (
            <ChatArea
              conversation={activeConv}
              currentUserId={user?.id || ""}
              onToggleProfile={() => setShowProfile(!showProfile)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquarePlus className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">No conversations yet</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Start a new conversation by finding someone to talk to.
              </p>
            </div>
          )}
        </main>

        {/* Right sidebar - profile */}
        {showProfile && activeConv && (
          <aside className="hidden md:block w-72 xl:w-80 border-l border-border/50 flex-shrink-0 bg-card">
            <ContactProfile
              conversation={activeConv}
              currentUserId={user?.id || ""}
              onClose={() => setShowProfile(false)}
            />
          </aside>
        )}

        {/* Mobile FAB */}
        <button
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-all z-20"
          aria-label="New message"
          onClick={() => setShowNewConversation(true)}
        >
          <MessageSquarePlus className="w-6 h-6" />
        </button>
      </div>

      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        currentUserId={user?.id || ""}
        onConversationStarted={(convId) => {
          setActiveConvId(convId);
          setShowProfile(false);
        }}
      />
    </div>
  );
};

export default Index;
