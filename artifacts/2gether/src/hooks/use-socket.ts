import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type Role = "driver" | "navigator" | null;

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  content: string;
  language: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export function useSocket(roomId: string, displayName: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [usersOnline, setUsersOnline] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [username, setUsername] = useState(displayName || "User");
  const [isHost, setIsHost] = useState(false);
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [users, setUsers] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);

  // Stable callback — defined before useEffect so it can be safely referenced
  const addSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), username: "System", message: text, timestamp: Date.now() },
    ]);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(window.location.origin, {
      path: "/api/socket.io",
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", { roomId, username: displayName || "User" });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("room-joined", (data: {
      username: string;
      usersOnline: number;
      isHost: boolean;
      roles: Record<string, Role>;
      users: string[];
      files: FileNode[];
      activeFileId: string | null;
    }) => {
      if (data.username) setUsername(data.username);
      if (typeof data.usersOnline === "number") setUsersOnline(data.usersOnline);
      setIsHost(!!data.isHost);
      setRoles(data.roles ?? {});
      setUsers(data.users ?? []);
      setFiles(data.files ?? []);
      setActiveFileId(data.activeFileId ?? null);
    });

    socket.on("user-joined", (data: { username: string; usersOnline: number; users?: string[] }) => {
      if (typeof data.usersOnline === "number") setUsersOnline(data.usersOnline);
      setUsers(data.users ?? []);
      addSystemMessage(`${data.username} joined the room.`);
    });

    socket.on("user-left", (data: { username: string; usersOnline: number; users?: string[] }) => {
      if (typeof data.usersOnline === "number") setUsersOnline(data.usersOnline);
      setUsers(data.users ?? []);
      addSystemMessage(`${data.username ?? "Someone"} left the room.`);
    });

    socket.on("user-count", (data: { usersOnline: number }) => {
      if (typeof data.usersOnline === "number") setUsersOnline(data.usersOnline);
    });

    socket.on("file-content-updated", (data: { fileId: string; code: string }) => {
      if (!data?.fileId) return;
      setFiles((prev) =>
        prev.map((f) => (f.id === data.fileId ? { ...f, content: data.code ?? "" } : f))
      );
    });

    socket.on("fs-updated", (data: { files: FileNode[]; newItemId?: string; deletedId?: string }) => {
      if (!Array.isArray(data?.files)) return;
      setFiles(data.files);
      if (data.deletedId) {
        setActiveFileId((current) => {
          if (current === data.deletedId) {
            const first = data.files.find((f) => f.type === "file");
            return first?.id ?? null;
          }
          return current;
        });
      }
      if (data.newItemId) {
        const newItem = data.files.find((f) => f.id === data.newItemId);
        if (newItem?.type === "file") setActiveFileId(data.newItemId);
      }
    });

    socket.on("chat-message", (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg])
    );

    socket.on("roles-updated", (data: { roles: Record<string, Role>; users: string[] }) => {
      setRoles(data.roles ?? {});
      setUsers(data.users ?? []);
    });

    socket.on("host-transferred", () => {
      setIsHost(true);
      addSystemMessage("You are now the host of this room.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, displayName, addSystemMessage]);

  const sendFileContentUpdate = useCallback((fileId: string, code: string) => {
    if (!fileId) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: code } : f))
    );
    socketRef.current?.emit("file-content-change", { roomId, fileId, code });
  }, [roomId]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: Math.random().toString(),
      username,
      message: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    socketRef.current?.emit("send-message", { roomId, message: text.trim() });
  }, [roomId, username]);

  const assignRole = useCallback((targetUsername: string, role: Role) => {
    socketRef.current?.emit("assign-role", { roomId, username: targetUsername, role });
  }, [roomId]);

  const createItem = useCallback((parentId: string | null, name: string, type: "file" | "folder") => {
    socketRef.current?.emit("create-item", { roomId, parentId, name, type });
  }, [roomId]);

  const deleteItem = useCallback((id: string) => {
    socketRef.current?.emit("delete-item", { roomId, id });
  }, [roomId]);

  const renameItem = useCallback((id: string, name: string) => {
    socketRef.current?.emit("rename-item", { roomId, id, name });
  }, [roomId]);

  const selectFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  const myRole: Role = roles[username] ?? null;

  return {
    isConnected,
    usersOnline,
    username,
    files,
    activeFileId,
    selectFile,
    messages,
    isHost,
    roles,
    users,
    myRole,
    sendFileContentUpdate,
    sendMessage,
    assignRole,
    createItem,
    deleteItem,
    renameItem,
  };
}
