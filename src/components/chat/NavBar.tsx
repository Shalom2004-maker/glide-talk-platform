import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface NavBarProps {
  onMenuToggle: () => void;
}

export function NavBar({ onMenuToggle }: NavBarProps) {
  const { theme, toggle } = useTheme();

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
        <button
          className="p-2.5 rounded-xl hover:bg-muted transition-colors"
          aria-label="Search"
        >
          <Search className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-4.5 h-4.5 text-muted-foreground" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-muted-foreground" />
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold ml-1">
          You
        </div>
      </div>
    </header>
  );
}
