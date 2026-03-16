import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Code2, ArrowRight, Sparkles, Terminal } from "lucide-react";
import { generateRoomId } from "@/lib/utils";

export function Home() {
  const [, setLocation] = useLocation();
  const [roomId, setRoomId] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      setLocation(`/room/${roomId.trim()}`);
    }
  };

  const handleGenerate = () => {
    setRoomId(generateRoomId());
  };

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Abstract dark background" 
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,122,204,0.15),transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 py-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,122,204,0.3)] text-primary"
        >
          <Code2 size={32} strokeWidth={2} />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 text-center"
        >
          2gether <span className="text-primary">Programming</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg text-muted-foreground mb-10 text-center max-w-md"
        >
          Code together in real-time. Share an editor, chat with your pair, and execute JavaScript instantly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="w-full bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="roomId" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Terminal size={16} className="text-primary" />
                Session ID
              </label>
              <div className="relative">
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter a room ID"
                  className="w-full h-12 bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-foreground placeholder:text-muted-foreground transition-all uppercase tracking-wider font-mono text-sm"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles size={14} className="text-accent" />
                  Generate
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!roomId.trim()}
              className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,122,204,0.4)] hover:shadow-[0_0_25px_rgba(0,122,204,0.6)] group"
            >
              Join Room
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 text-sm text-muted-foreground/60 flex items-center gap-4"
        >
          <span>VS Code Theme</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Real-time Sync</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Live Execution</span>
        </motion.div>
      </div>
    </div>
  );
}
