import MonacoEditor from "@monaco-editor/react";
import { Loader2, Eye, Lock } from "lucide-react";

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  const colors: Record<string, string> = {
    js: "#f7df1e", jsx: "#f7df1e", ts: "#3178c6", tsx: "#3178c6",
    py: "#3776ab", java: "#f89820", cpp: "#004482", cc: "#004482",
    c: "#004482", html: "#e34f26", htm: "#e34f26", css: "#1572b6",
    rs: "#ce422b", go: "#00add8", json: "#f0a500", md: "#94a3b8",
  };
  return ext && colors[ext] ? colors[ext] : "#94a3b8";
}

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language: string;
  filename: string;
}

export function Editor({ code, onChange, readOnly = false, language, filename }: EditorProps) {
  const dotColor = getFileIcon(filename);

  return (
    <div className="flex-1 relative bg-background flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="h-9 border-b border-border bg-sidebar flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center">
          {filename ? (
            <div className="flex items-center gap-2 bg-background border-t border-l border-r border-border px-4 py-1.5 rounded-t text-xs font-medium text-foreground/90 -mb-[1px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
              {filename}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground">
              No file selected
            </div>
          )}
        </div>
        {readOnly && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/30 px-2.5 py-1 rounded-full mr-2">
            <Eye size={12} />
            Navigator — Read Only
          </div>
        )}
      </div>

      {/* Monaco */}
      <div className="flex-1 w-full relative">
        {readOnly && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[11px] font-semibold text-[#a855f7]/60 bg-[#a855f7]/5 px-2 py-1 rounded-full border border-[#a855f7]/20 pointer-events-none">
            <Lock size={10} /> Observing
          </div>
        )}
        {filename ? (
          <MonacoEditor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => !readOnly && onChange(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "var(--font-mono)",
              lineHeight: 24,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: !readOnly,
              overviewRulerLanes: 0,
              wordWrap: "on",
              readOnly,
              domReadOnly: readOnly,
            }}
            loading={
              <div className="flex items-center justify-center h-full w-full bg-background text-muted-foreground">
                <Loader2 className="animate-spin w-6 h-6 mr-2" />
                Loading editor...
              </div>
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-3">
            <span className="text-4xl">📄</span>
            <p className="text-sm">Select or create a file to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}
