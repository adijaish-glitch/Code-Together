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
    isConnected,
    usersOnline,
    username,
    files = [],       // default prevents crash if socket hasn't connected yet
    activeFileId,
    selectFile,
    messages = [],
    isHost,
    roles = {},
    users = [],
    myRole,
    sendFileContentUpdate,
    sendMessage,
    assignRole,
    createItem,
    deleteItem,
    renameItem,
  } = useSocket(roomId ?? "default", displayName ?? "");

  const { mutate: runCode, isPending: isRunning } = useRunCode();

  // Safely find active file — files defaults to [] above
  const activeFile = files.find((f) => f.id === activeFileId) ?? null;
  const activeCode = activeFile?.content ?? "";
  const activeLanguage = activeFile?.language ?? "javascript";
  const activeFilename = activeFile?.name ?? "";

  const handleCodeChange = (code: string) => {
    if (activeFileId) sendFileContentUpdate(activeFileId, code);
  };

  const handleRunCode = () => {
    setOutput("");
    setError(undefined);
    if (activeLanguage !== "javascript") {
      setError(`Execution is only supported for JavaScript.\nOpen or create a .js file to run code.`);
      return;
    }
    runCode(activeCode, {
      onSuccess: (data) => {
        setOutput(data.output ?? "");
        setError(data.error ?? undefined);
      },
      onError: (err) => setError(err.message),
    });
  };

  const isReadOnly = myRole === "navigator";

  if (!roomId) return null;

  // Show username modal before entering the room
  if (!displayName) {
    return (
      <div className="h-screen w-full bg-background">
        <AnimatePresence>
          <UsernameModal
            onConfirm={(name) => {
              saveUsername(name);
              setDisplayName(name);
            }}
          />
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

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* File Explorer */}
        <FileTree
          files={files}
          activeFileId={activeFileId}
          onSelectFile={selectFile}
          onCreateItem={createItem}
          onDeleteItem={deleteItem}
          onRenameItem={renameItem}
        />

        {/* Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <Editor
            code={activeCode}
            onChange={handleCodeChange}
            readOnly={isReadOnly}
            language={activeLanguage}
            filename={activeFilename}
          />
          <Console
            className="h-1/3 min-h-[180px] max-h-[40%]"
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
