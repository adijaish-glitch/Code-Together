import { Terminal, Play, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsoleProps {
  output: string;
  error?: string;
  isRunning: boolean;
  onRun: () => void;
  onClear: () => void;
  className?: string;
}

export function Console({ output, error, isRunning, onRun, onClear, className }: ConsoleProps) {
  return (
    <div className={cn("flex flex-col bg-panel border-t border-border", className)}>
      <div className="h-10 flex items-center justify-between px-4 border-b border-border bg-sidebar shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Terminal size={14} />
          <span>Console</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
            title="Clear Console"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
          
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-success hover:bg-success/90 rounded shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            <Play size={14} className={cn(isRunning && "animate-pulse")} fill="currentColor" />
            <span>{isRunning ? "Running..." : "Run Code"}</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed select-text">
        {!output && !error && (
          <div className="text-muted-foreground/50 italic h-full flex items-center justify-center">
            Output will appear here...
          </div>
        )}
        
        {output && (
          <pre className="text-foreground whitespace-pre-wrap mb-2">{output}</pre>
        )}
        
        {error && (
          <div className="flex items-start gap-2 text-destructive mt-2 p-3 bg-destructive/10 rounded border border-destructive/20">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap break-words">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
