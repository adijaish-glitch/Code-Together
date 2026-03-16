import MonacoEditor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function Editor({ code, onChange }: EditorProps) {
  return (
    <div className="flex-1 relative bg-background flex flex-col min-h-0">
      <div className="h-9 border-b border-border bg-sidebar flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2 bg-background border-t border-l border-r border-border px-4 py-1.5 rounded-t text-xs font-medium text-primary -mb-[1px]">
          <span className="w-2 h-2 rounded-full bg-primary/50" />
          index.js
        </div>
      </div>
      <div className="flex-1 w-full relative">
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(val) => onChange(val || "")}
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
            formatOnPaste: true,
            overviewRulerLanes: 0,
            wordWrap: "on",
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
