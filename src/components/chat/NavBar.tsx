import { Search, Sun, Moon, Menu, User, LogOut, Shield } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/hooks/useChat";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

interface NavBarProps {
  onMenuToggle: () => void;
  onNewConversation: () => void;
}

export function NavBar({ onMenuToggle, onNewConversation }: NavBarProps) {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <header className="h-14 flex items-center justify-between px-4 glass-panel border-b border-border/50 z-20 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-primary">Let</span>
          <span className="text-foreground">Chat</span>
          <span className="text-primary">.</span>
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onNewConversation} className="p-2.5 rounded-xl hover:bg-muted transition-colors" aria-label="Search">
          <Search className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
        <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-muted transition-colors" aria-label="Toggle theme">
          {theme === "light" ? <Moon className="w-4.5 h-4.5 text-muted-foreground" /> : <Sun className="w-4.5 h-4.5 text-muted-foreground" />}
        </button>

        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            {initials}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-44 rounded-xl border border-border bg-card shadow-lg py-1 z-50 animate-fade-in">
              <button
                onClick={() => { setShowMenu(false); navigate("/profile"); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              {isAdmin && (
                <button
                  onClick={() => { setShowMenu(false); navigate("/admin"); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Shield className="w-4 h-4" /> Admin Dashboard
                </button>
              )}
              <button
                onClick={async () => { setShowMenu(false); await signOut(); navigate("/login"); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
