export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mt-3">
      <div className="w-7" />
      <div className="bg-bubble-receiver rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-1" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-2" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-3" />
      </div>
    </div>
  );
}
