import { Link } from "wouter";
import { Users, Copy, Check, LogOut, Code2, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopNavProps {
  roomId: string;
  usersOnline: number;
  isConnected: boolean;
}

export function TopNav({ roomId, usersOnline, isConnected }: TopNavProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-12 border-b border-border bg-sidebar flex items-center justify-between px-4 shrink-0 select-none z-10 relative">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Code2 size={18} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground hidden sm:block">
            2gether Programming
          </span>
        </Link>
        <div className="w-px h-5 bg-border mx-2 hidden sm:block" />
        <div className="flex items-center gap-2 bg-background/50 px-2.5 py-1 rounded border border-border/50">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">ROOM</span>
          <span className="text-xs font-mono text-foreground font-medium">{roomId}</span>
          <button 
            onClick={copyRoomId}
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            title="Copy Room ID"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {isConnected ? (
            <Wifi size={14} className="text-success" />
          ) : (
            <WifiOff size={14} className="text-destructive" />
          )}
          <span className={cn(isConnected ? "text-success" : "text-destructive")}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-medium bg-secondary/50 px-2.5 py-1 rounded-full border border-border/50">
          <Users size={14} className={usersOnline > 1 ? "text-primary" : "text-muted-foreground"} />
          <span className="text-foreground">{usersOnline} <span className="text-muted-foreground hidden sm:inline">online</span></span>
        </div>

        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-3 py-1.5 rounded transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Leave</span>
        </Link>
      </div>
    </div>
  );
}
