import MonacoEditor from "@monaco-editor/react";
import { Loader2, Eye, Lock } from "lucide-react";

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function Editor({ code, onChange, readOnly = false }: EditorProps) {
  return (
    <div className="flex-1 relative bg-background flex flex-col min-h-0">
      <div className="h-9 border-b border-border bg-sidebar flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 bg-background border-t border-l border-r border-border px-4 py-1.5 rounded-t text-xs font-medium text-primary -mb-[1px]">
          <span className="w-2 h-2 rounded-full bg-primary/50" />
          index.js
        </div>
        {readOnly && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/30 px-2.5 py-1 rounded-full">
            <Eye size={12} />
            Navigator — Read Only
          </div>
        )}
      </div>
      <div className="flex-1 w-full relative">
        {readOnly && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#a855f7]/60 bg-[#a855f7]/5 px-2 py-1 rounded-full border border-[#a855f7]/20">
              <Lock size={10} /> Observing
            </div>
          </div>
        )}
        <MonacoEditor
          height="100%"
          language="javascript"
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
      </div>
    </div>
  );
}
