import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: Message[];
  currentUser: string;
  onSendMessage: (msg: string) => void;
  className?: string;
}

export function ChatPanel({ messages, currentUser, onSendMessage, className }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className={cn("flex flex-col bg-sidebar border-l border-border", className)}>
      <div className="h-12 border-b border-border flex items-center px-4 shrink-0 bg-sidebar/50">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare size={16} className="text-primary" />
          <span>Team Chat</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm text-center space-y-2 opacity-50">
            <MessageSquare size={32} />
            <p>No messages yet.<br/>Say hello to your pair!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = msg.username === "System";
            const isMe = msg.username === currentUser;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-[11px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[85%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {isMe ? "You" : msg.username}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">
                    {format(msg.timestamp, "HH:mm")}
                  </span>
                </div>
                <div 
                  className={cn(
                    "px-3 py-2 rounded-xl text-[13px] shadow-sm",
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-secondary text-secondary-foreground rounded-tl-sm border border-border/50"
                  )}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-border bg-sidebar shrink-0">
        <form 
          onSubmit={handleSend}
          className="flex items-end gap-2 bg-background border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-lg p-1 transition-all"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[36px] bg-transparent text-sm resize-none focus:outline-none p-2 text-foreground placeholder:text-muted-foreground"
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary transition-colors shrink-0 mb-0.5 mr-0.5"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
