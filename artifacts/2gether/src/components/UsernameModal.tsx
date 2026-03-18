import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ArrowRight, Sparkles } from "lucide-react";

const ADJECTIVES = ["Clever", "Swift", "Mighty", "Cosmic", "Neon", "Pixel", "Turbo", "Crispy", "Quantum", "Glitch"];
const NOUNS = ["Coder", "Hacker", "Ninja", "Wizard", "Dev", "Builder", "Ranger", "Bot", "Shark", "Fox"];

function randomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}

interface UsernameModalProps {
  onConfirm: (username: string) => void;
  defaultUsername?: string;
}

export function UsernameModal({ onConfirm, defaultUsername }: UsernameModalProps) {
  const [name, setName] = useState(defaultUsername || randomName());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-sm bg-sidebar border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <User size={26} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Choose your username</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            This is how others will see you in chat and as a collaborator.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="e.g. QuantumCoder"
              className="w-full bg-background border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-3 text-foreground font-medium text-base focus:outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setName(randomName())}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              title="Generate random name"
            >
              <Sparkles size={16} />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Click the sparkle to generate a random name
          </p>

          <button
            type="submit"
            disabled={name.trim().length < 2}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
          >
            Enter Room <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export function getSavedUsername(): string | null {
  return localStorage.getItem("2gether-username");
}

export function saveUsername(username: string) {
  localStorage.setItem("2gether-username", username);
}
