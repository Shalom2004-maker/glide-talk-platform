import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  MessageSquare,
  MessageSquareText,
  Ban,
  Shield,
  Search,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  ShieldOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  useAdminStats,
  useAdminUsers,
  useAdminRecentMessages,
  useSetUserAdmin,
  useSetUserBanned,
  useSetUserVerified,
  useDeleteUser,
  useDeleteMessage,
  useIsAdmin,
} from "@/hooks/useChat";
import { useAuth } from "@/lib/auth";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
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

function Avatar({ name }: { name: string | null }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
      {getInitials(name)}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const [search, setSearch] = useState("");
  const { data: users = [], isLoading: usersLoading } = useAdminUsers(search);
  const { data: recentMessages = [] } = useAdminRecentMessages();

  const setAdmin = useSetUserAdmin();
  const setBanned = useSetUserBanned();
  const setVerified = useSetUserVerified();
  const deleteUser = useDeleteUser();
  const deleteMessage = useDeleteMessage();

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <Shield className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          You do not have administrator privileges to view this page.
        </p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          Back to Chat
        </Button>
      </div>
    );
  }

  const handleDeleteUser = (u: { user_id: string; display_name: string | null }) => {
    if (u.user_id === user?.id) {
      toast({ title: "Cannot delete your own account" });
      return;
    }
    toast({
      title: "Delete user",
      description: `Deactivate ${u.display_name || "user"}? This cannot be undone.`,
      action: (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteUser.mutate(u.user_id)}
        >
          Delete
        </Button>
      ),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 flex items-center justify-between px-4 glass-panel border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-primary">Admin</span> Dashboard
          </h1>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="w-3 h-3" /> Admin
        </Badge>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<Users className="w-5 h-5 text-primary" />} />
          <StatCard title="Online Now" value={stats?.onlineUsers || 0} icon={<Activity className="w-5 h-5 text-green-500" />} />
          <StatCard title="Banned" value={stats?.bannedUsers || 0} icon={<Ban className="w-5 h-5 text-destructive" />} />
          <StatCard title="Conversations" value={stats?.totalConversations || 0} icon={<MessageSquare className="w-5 h-5 text-primary" />} />
          <StatCard title="Total Messages" value={stats?.totalMessages || 0} icon={<MessageSquareText className="w-5 h-5 text-primary" />} />
          <StatCard title="Messages Today" value={stats?.messagesToday || 0} icon={<MessageSquareText className="w-5 h-5 text-amber-500" />} />
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="messages">Recent Messages</TabsTrigger>
          </TabsList>

          {/* Users */}
          <TabsContent value="users" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name..."
                className="pl-9"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">User</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Banned</TableHead>
                      <TableHead>Online</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => {
                        const isSelf = u.user_id === user?.id;
                        return (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar name={u.display_name} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                                    {u.display_name || "Unknown"}
                                    {u.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                                    {isSelf && <Badge variant="secondary" className="text-[10px]">You</Badge>}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">{u.user_id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={u.is_admin}
                                disabled={isSelf || setAdmin.isPending}
                                onCheckedChange={(v) => setAdmin.mutate({ userId: u.user_id, isAdmin: v })}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={u.is_verified}
                                disabled={setVerified.isPending}
                                onCheckedChange={(v) => setVerified.mutate({ userId: u.user_id, isVerified: v })}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={u.is_banned}
                                disabled={isSelf || setBanned.isPending}
                                onCheckedChange={(v) => setBanned.mutate({ userId: u.user_id, isBanned: v })}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant={u.is_online ? "default" : "secondary"}>
                                {u.is_online ? "Online" : "Offline"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(u.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                disabled={isSelf || deleteUser.isPending}
                                onClick={() => handleDeleteUser(u)}
                                aria-label="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sender</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMessages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No messages yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentMessages.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar name={m.sender_profile.display_name} />
                              <span className="text-sm font-medium text-foreground">
                                {m.sender_profile.display_name || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="text-sm text-foreground truncate">{m.content}</p>
                            {m.attachment_name && (
                              <p className="text-xs text-muted-foreground">📎 {m.attachment_name}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(m.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteMessage.mutate(m.id)}
                              aria-label="Delete message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
