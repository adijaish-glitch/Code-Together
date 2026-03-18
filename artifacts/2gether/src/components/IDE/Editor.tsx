import MonacoEditor from "@monaco-editor/react";
import { Loader2, Eye, Lock, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", ext: "js", color: "#f7df1e", runnable: true },
  { id: "typescript", label: "TypeScript", ext: "ts", color: "#3178c6", runnable: false },
  { id: "python", label: "Python", ext: "py", color: "#3776ab", runnable: false },
  { id: "java", label: "Java", ext: "java", color: "#f89820", runnable: false },
  { id: "cpp", label: "C++", ext: "cpp", color: "#004482", runnable: false },
  { id: "html", label: "HTML", ext: "html", color: "#e34f26", runnable: false },
  { id: "css", label: "CSS", ext: "css", color: "#1572b6", runnable: false },
  { id: "rust", label: "Rust", ext: "rs", color: "#ce422b", runnable: false },
  { id: "go", label: "Go", ext: "go", color: "#00add8", runnable: false },
];

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export function Editor({ code, onChange, readOnly = false, language, onLanguageChange }: EditorProps) {
  const [showLangPicker, setShowLangPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  const handleLangSelect = (langId: string) => {
    onLanguageChange(langId);
    setShowLangPicker(false);
  };

  return (
    <div className="flex-1 relative bg-background flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="h-9 border-b border-border bg-sidebar flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-0">
          <div className="flex items-center gap-2 bg-background border-t border-l border-r border-border px-4 py-1.5 rounded-t text-xs font-medium text-primary -mb-[1px]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentLang.color }} />
            index.{currentLang.ext}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {readOnly && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/30 px-2.5 py-1 rounded-full">
              <Eye size={12} />
              Navigator — Read Only
            </div>
          )}

          {/* Language picker */}
          <div ref={pickerRef} className="relative">
            <button
              onClick={() => setShowLangPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-md transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentLang.color }}
              />
              {currentLang.label}
              <ChevronDown size={12} className={`transition-transform ${showLangPicker ? "rotate-180" : ""}`} />
            </button>

            {showLangPicker && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-sidebar border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLangSelect(lang.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-secondary transition-colors ${
                      lang.id === currentLang.id ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
                    <span>{lang.label}</span>
                    {lang.runnable && (
                      <span className="ml-auto text-[9px] font-bold text-success uppercase">runnable</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative" onClick={() => showLangPicker && setShowLangPicker(false)}>
        {readOnly && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[11px] font-semibold text-[#a855f7]/60 bg-[#a855f7]/5 px-2 py-1 rounded-full border border-[#a855f7]/20 pointer-events-none">
            <Lock size={10} /> Observing
          </div>
        )}
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
      </div>
    </div>
  );
}

export { LANGUAGES };
