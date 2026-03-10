import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { NavBar } from "@/components/chat/NavBar";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatArea } from "@/components/chat/ChatArea";
import { ContactProfile } from "@/components/chat/ContactProfile";
import { conversations } from "@/lib/mockData";

const Index = () => {
  const [activeConvId, setActiveConvId] = useState(conversations[0].id);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <NavBar onMenuToggle={() => setShowSidebar(!showSidebar)} />

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
            activeId={activeConvId}
            onSelect={(id) => {
              setActiveConvId(id);
              setShowSidebar(false);
            }}
          />
        </aside>

        {/* Main chat */}
        <main className="flex-1 min-w-0 bg-background">
          <ChatArea
            conversation={activeConv}
            onToggleProfile={() => setShowProfile(!showProfile)}
          />
        </main>

        {/* Right sidebar - profile */}
        {showProfile && (
          <aside className="hidden md:block w-72 xl:w-80 border-l border-border/50 flex-shrink-0 bg-card">
            <ContactProfile
              contact={activeConv.contact}
              onClose={() => setShowProfile(false)}
            />
          </aside>
        )}

        {/* Mobile FAB */}
        <button
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-all z-20"
          aria-label="New message"
        >
          <MessageSquarePlus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Index;
