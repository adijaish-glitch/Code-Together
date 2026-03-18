import { useState } from "react";
import { useParams } from "wouter";
import { AnimatePresence } from "framer-motion";
import { TopNav } from "@/components/IDE/TopNav";
import { Editor } from "@/components/IDE/Editor";
import { Console } from "@/components/IDE/Console";
import { ChatPanel } from "@/components/IDE/ChatPanel";
import { FileTree } from "@/components/IDE/FileTree";
import { UsernameModal, getSavedUsername, saveUsername } from "@/components/UsernameModal";
import { useSocket } from "@/hooks/use-socket";
import { useRunCode } from "@/hooks/use-run-code";

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();

  const [displayName, setDisplayName] = useState<string | null>(() => getSavedUsername());
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();

  const {
    isConnected, usersOnline, username, files, activeFileId, setActiveFileId,
    messages, isHost, roles, users, myRole,
    sendFileContentUpdate, sendMessage, assignRole,
    createItem, deleteItem, renameItem,
  } = useSocket(roomId || "default-room", displayName ?? "");

  const { mutate: runCode, isPending: isRunning } = useRunCode();

  // Derive active file object from files array
  const activeFile = files.find((f) => f.id === activeFileId) ?? null;
  const activeCode = activeFile?.content ?? "";
  const activeLanguage = activeFile?.language ?? "javascript";

  const handleCodeChange = (code: string) => {
    if (activeFileId) sendFileContentUpdate(activeFileId, code);
  };

  const handleRunCode = () => {
    setOutput("");
    setError(undefined);
    if (activeLanguage !== "javascript") {
      setError(`Execution is only supported for JavaScript.\nSwitch to a .js file to run code.`);
      return;
    }
    runCode(activeCode, {
      onSuccess: (data) => { setOutput(data.output); setError(data.error); },
      onError: (err) => setError(err.message),
    });
  };

  const isReadOnly = myRole === "navigator";

  if (!roomId) return null;

  if (displayName === null) {
    return (
      <div className="h-screen w-full bg-background">
        <AnimatePresence>
          <UsernameModal onConfirm={(name) => { saveUsername(name); setDisplayName(name); }} />
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
        {/* File Tree */}
        <FileTree
          files={files}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onCreateItem={createItem}
          onDeleteItem={deleteItem}
          onRenameItem={renameItem}
        />

        {/* Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0">
          <Editor
            code={activeCode}
            onChange={handleCodeChange}
            readOnly={isReadOnly}
            language={activeLanguage}
            filename={activeFile?.name ?? ""}
          />
          <Console
            className="h-1/3 min-h-[200px]"
            output={output}
            error={error}
            isRunning={isRunning}
            onRun={handleRunCode}
            onClear={() => { setOutput(""); setError(undefined); }}
          />
        </div>

        {/* Chat + AI */}
        <ChatPanel
          className="w-[300px] lg:w-[340px] shrink-0"
          messages={messages}
          currentUser={username}
          onSendMessage={sendMessage}
          code={activeCode}
          language={activeLanguage}
        />
      </div>
    </div>
  );
}
