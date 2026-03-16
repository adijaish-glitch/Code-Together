import { useState } from "react";
import { useParams } from "wouter";
import { TopNav } from "@/components/IDE/TopNav";
import { Editor } from "@/components/IDE/Editor";
import { Console } from "@/components/IDE/Console";
import { ChatPanel } from "@/components/IDE/ChatPanel";
import { useSocket } from "@/hooks/use-socket";
import { useRunCode } from "@/hooks/use-run-code";

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  
  // Connect to room via socket
  const { 
    isConnected, 
    usersOnline, 
    username, 
    code, 
    messages, 
    sendCodeUpdate, 
    sendMessage 
  } = useSocket(roomId || "default-room");

  // Code execution state
  const { mutate: runCode, isPending: isRunning } = useRunCode();
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleRunCode = () => {
    setOutput("");
    setError(undefined);
    runCode(code, {
      onSuccess: (data) => {
        setOutput(data.output);
        setError(data.error);
      },
      onError: (err) => {
        setError(err.message);
      }
    });
  };

  const handleClearConsole = () => {
    setOutput("");
    setError(undefined);
  };

  if (!roomId) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <TopNav 
        roomId={roomId} 
        usersOnline={usersOnline} 
        isConnected={isConnected} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Left Column: Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0">
          <Editor 
            code={code} 
            onChange={sendCodeUpdate} 
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
        
        {/* Right Column: Chat */}
        <ChatPanel 
          className="w-[300px] lg:w-[350px] shrink-0"
          messages={messages}
          currentUser={username}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
