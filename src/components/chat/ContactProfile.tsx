import { X, BellOff, Ban, Image, FileText, Link } from "lucide-react";
import { Contact } from "@/lib/mockData";

interface ContactProfileProps {
  contact: Contact;
  onClose: () => void;
}

export function ContactProfile({ contact, onClose }: ContactProfileProps) {
  return (
    <div className="h-full flex flex-col glass-panel animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Contact Info</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-3">
            {contact.avatar}
          </div>
          <h4 className="text-lg font-semibold text-foreground">{contact.name}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${contact.status === "online" ? "bg-online" : "bg-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground capitalize">
              {contact.status === "online" ? "Online" : `Last seen ${contact.lastSeen}`}
            </span>
          </div>
        </div>

        {/* Shared media */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shared Media</h5>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Image className="w-4 h-4 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        </div>

        {/* Shared files */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shared Files</h5>
          <div className="space-y-2">
            {["Design_specs.pdf", "Meeting_notes.docx"].map((f) => (
              <div key={f} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-foreground truncate">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shared Links</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Link className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary truncate">figma.com/design-system</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-sm text-foreground">
            <BellOff className="w-4 h-4 text-muted-foreground" />
            Mute notifications
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-sm text-destructive">
            <Ban className="w-4 h-4" />
            Block contact
          </button>
        </div>
      </div>
    </div>
  );
}
