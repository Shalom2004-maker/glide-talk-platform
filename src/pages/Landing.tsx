import { Link, Navigate } from "react-router-dom";
import {
  Zap,
  CircleDot,
  PenLine,
  UserRound,
  Paperclip,
  MessagesSquare,
  CheckCheck,
  BellOff,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatPreview } from "@/components/landing/ChatPreview";

const features = [
  {
    icon: Zap,
    title: "Instant messaging",
    description: "Messages land the moment they're sent — in one-to-one chats, with no page reloads.",
  },
  {
    icon: CircleDot,
    title: "Live presence",
    description: "See who's online in every conversation, so you always know when someone's around.",
  },
  {
    icon: PenLine,
    title: "Typing indicators",
    description: "Replies show up as they're being typed — no waiting on silence.",
  },
  {
    icon: UserRound,
    title: "Profiles & avatars",
    description: "Set a display name, bio, status message, and a custom avatar.",
  },
  {
    icon: Paperclip,
    title: "Files & attachments",
    description: "Drop images and documents straight into the composer and send them instantly.",
  },
  {
    icon: MessagesSquare,
    title: "Conversation management",
    description: "Search contacts, keep conversations organized, and never miss an unread message.",
  },
  {
    icon: CheckCheck,
    title: "Read receipts & reactions",
    description: "Know when messages are read, and react with emoji instead of a reply.",
  },
  {
    icon: BellOff,
    title: "Mute & block",
    description: "Mute any conversation and block contacts whenever you need a break.",
  },
];

const Logo = () => (
  <span className="text-xl sm:text-2xl font-bold tracking-tight">
    <span className="text-primary">Let</span>
    <span className="text-foreground">Chat</span>
    <span className="text-primary">.</span>
  </span>
);

export default function Landing() {
  const { user, loading } = useAuth();
  const { theme, toggle } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/50">
        <div className="mx-auto max-w-6xl h-14 px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" aria-label="LetChat home">
            <Logo />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-4.5 h-4.5 text-muted-foreground" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-muted-foreground" />
              )}
            </button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-online" />
              Real-time messaging
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Talk in real time,
              <br />
              <span className="text-primary">without the noise.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-muted-foreground">
              LetChat is a no-fuss messenger for the conversations that matter — instant messages,
              file sharing, live presence, and typing indicators, in clean private chats.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Product preview */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <ChatPreview />
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Everything a conversation needs
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Built for fast, focused chats — nothing more.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="glass-panel rounded-2xl px-6 py-12 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Start talking in under a minute.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-muted-foreground">
              Create an account, find the people you talk to most, and send your first message.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/signup">Create Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" aria-label="LetChat home">
            <Logo />
          </Link>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}