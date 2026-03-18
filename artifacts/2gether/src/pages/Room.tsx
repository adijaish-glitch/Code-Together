import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { AnimatePresence } from "framer-motion";
import { TopNav } from "@/components/IDE/TopNav";
import { Editor } from "@/components/IDE/Editor";
import { Console } from "@/components/IDE/Console";
import { ChatPanel } from "@/components/IDE/ChatPanel";
import { UsernameModal, getSavedUsername, saveUsername } from "@/components/UsernameModal";
import { useSocket } from "@/hooks/use-socket";
import { useRunCode } from "@/hooks/use-run-code";

const DEFAULT_CODE_BY_LANGUAGE: Record<string, string> = {
  javascript: "// Write your JavaScript here\nconsole.log('Hello, 2gether!');",
  typescript: "// Write your TypeScript here\nconst greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet('2gether'));",
  python: "# Write your Python here\ndef greet(name: str) -> str:\n    return f'Hello, {name}!'\n\nprint(greet('2gether'))",
  java: "// Write your Java here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, 2gether!\");\n    }\n}",
  cpp: "// Write your C++ here\n#include <iostream>\n\nint main() {\n    std::cout << \"Hello, 2gether!\" << std::endl;\n    return 0;\n}",
  html: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>2gether</title>\n</head>\n<body>\n  <h1>Hello, 2gether!</h1>\n</body>\n</html>",
  css: "/* Write your CSS here */\nbody {\n  font-family: Inter, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  margin: 0;\n}",
  rust: "// Write your Rust here\nfn main() {\n    println!(\"Hello, 2gether!\");\n}",
  go: "// Write your Go here\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, 2gether!\")\n}",
};

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();

  // Username state — prompt if not set
  const [displayName, setDisplayName] = useState<string | null>(() => getSavedUsername());
  const [language, setLanguage] = useState("javascript");

  const {
    isConnected,
    usersOnline,
    username,
    code,
    messages,
    isHost,
    roles,
    users,
    myRole,
    sendCodeUpdate,
    sendMessage,
    assignRole,
  } = useSocket(roomId || "default-room", displayName ?? "");

  const { mutate: runCode, isPending: isRunning } = useRunCode();
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleRunCode = () => {
    setOutput("");
    setError(undefined);
    if (language !== "javascript") {
      setError(`Execution is only supported for JavaScript.\nSwitch to JavaScript to run code.`);
      return;
    }
    runCode(code, {
      onSuccess: (data) => {
        setOutput(data.output);
        setError(data.error);
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  };

  const handleClearConsole = () => {
    setOutput("");
    setError(undefined);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // If the current code is one of the defaults for the previous language, swap to new default
    const newDefault = DEFAULT_CODE_BY_LANGUAGE[lang];
    if (newDefault) {
      sendCodeUpdate(newDefault);
    }
  };

  const handleConfirmUsername = (name: string) => {
    saveUsername(name);
    setDisplayName(name);
  };

  const isReadOnly = myRole === "navigator";

  if (!roomId) return null;

  // Show username modal before entering if no name is set
  if (displayName === null) {
    return (
      <div className="h-screen w-full bg-background">
        <AnimatePresence>
          <UsernameModal onConfirm={handleConfirmUsername} />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <TopNav
        roomId={roomId}
        usersOnline={usersOnline}
        isConnected={isConnected}
        isHost={isHost}
        users={users}
        roles={roles}
        currentUser={username}
        myRole={myRole}
        onAssignRole={assignRole}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Left Column: Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0">
          <Editor
            code={code}
            onChange={sendCodeUpdate}
            readOnly={isReadOnly}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
          <Console
            className="h-1/3 min-h-[200px]"
            output={output}
            error={error}
            isRunning={isRunning}
            onRun={handleRunCode}
            onClear={handleClearConsole}
          />
        </div>

        {/* Right Column: Chat + AI */}
        <ChatPanel
          className="w-[300px] lg:w-[350px] shrink-0"
          messages={messages}
          currentUser={username}
          onSendMessage={sendMessage}
          code={code}
          language={language}
        />
      </div>
    </div>
  );
}
