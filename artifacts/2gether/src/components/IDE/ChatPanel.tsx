import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageSquare, Bot, Loader2, User, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  currentUser: string;
  onSendMessage: (msg: string) => void;
  code?: string;
  language?: string;
  className?: string;
}

function TeamChat({ messages, currentUser, onSendMessage }: {
  messages: Message[];
  currentUser: string;
  onSendMessage: (msg: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm text-center space-y-2 opacity-50">
            <MessageSquare size={32} />
            <p>No messages yet.<br />Say hello to your pair!</p>
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
                className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <div className="flex items-center gap-1.5">
                    {!isMe && (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                        {msg.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {isMe ? "You" : msg.username}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/60">{format(msg.timestamp, "HH:mm")}</span>
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
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[36px] bg-transparent text-sm resize-none focus:outline-none p-2 text-foreground placeholder:text-muted-foreground"
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md disabled:opacity-50 transition-colors shrink-0 mb-0.5 mr-0.5"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}

function AiChat({ code, language }: { code?: string; language?: string }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: AiMessage = { id: Math.random().toString(), role: "user", content: text.trim() };
    const assistantMsg: AiMessage = { id: Math.random().toString(), role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), code, language, history }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: last.content + data.content };
                }
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: "Sorry, something went wrong. Please try again." };
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages, code, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot size={28} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Coding Assistant</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask me to explain code, find bugs,<br />suggest improvements, or write functions.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
              {["Explain this code", "Find bugs", "Optimize performance", "Write tests"].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs bg-secondary hover:bg-primary/10 hover:text-primary text-muted-foreground px-3 py-2 rounded-lg border border-border transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "assistant"
                  ? "bg-primary/10 border border-primary/20 text-primary"
                  : "bg-secondary border border-border text-muted-foreground"
              )}
            >
              {msg.role === "assistant" ? <Bot size={15} /> : <User size={14} />}
            </div>
            <div
              className={cn(
                "max-w-[85%] px-3 py-2.5 rounded-xl text-[13px] shadow-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-secondary text-secondary-foreground rounded-tl-sm border border-border/50"
              )}
            >
              {msg.content || (msg.role === "assistant" && isStreaming && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 size={12} className="animate-spin" /> Thinking...
                </span>
              ))}
              {msg.content && msg.role === "assistant" && (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border bg-sidebar shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 bg-background border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-lg p-1 transition-all"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder={isStreaming ? "AI is responding..." : "Ask the AI assistant..."}
            disabled={isStreaming}
            className="flex-1 max-h-32 min-h-[36px] bg-transparent text-sm resize-none focus:outline-none p-2 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md disabled:opacity-50 transition-colors shrink-0 mb-0.5 mr-0.5"
          >
            {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </>
  );
}

export function ChatPanel({ messages, currentUser, onSendMessage, code, language, className }: ChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"team" | "ai">("team");
  const [teamUnread, setTeamUnread] = useState(0);
  const prevLenRef = useRef(messages.length);

  useEffect(() => {
    if (activeTab !== "team" && messages.length > prevLenRef.current) {
      setTeamUnread((n) => n + messages.length - prevLenRef.current);
    }
    prevLenRef.current = messages.length;
  }, [messages.length, activeTab]);

  const handleTabChange = (tab: "team" | "ai") => {
    setActiveTab(tab);
    if (tab === "team") setTeamUnread(0);
  };

  return (
    <div className={cn("flex flex-col bg-sidebar border-l border-border", className)}>
      {/* Tab header */}
      <div className="h-12 border-b border-border flex items-center shrink-0 bg-sidebar/50 px-2 gap-1">
        <button
          onClick={() => handleTabChange("team")}
          className={cn(
            "flex items-center gap-1.5 flex-1 justify-center text-xs font-semibold py-2 px-3 rounded-lg transition-colors relative",
            activeTab === "team"
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <MessageSquare size={14} />
          Team Chat
          {teamUnread > 0 && activeTab !== "team" && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {teamUnread > 9 ? "9+" : teamUnread}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange("ai")}
          className={cn(
            "flex items-center gap-1.5 flex-1 justify-center text-xs font-semibold py-2 px-3 rounded-lg transition-colors",
            activeTab === "ai"
              ? "bg-background text-primary shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <Bot size={14} />
          AI Assistant
        </button>
      </div>

      {activeTab === "team" ? (
        <TeamChat messages={messages} currentUser={currentUser} onSendMessage={onSendMessage} />
      ) : (
        <AiChat code={code} language={language} />
      )}
    </div>
  );
}
