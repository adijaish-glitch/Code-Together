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
  const [username, setUsername] = useState(displayName);
  const [isHost, setIsHost] = useState(false);
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [users, setUsers] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);

  const addSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), username: "System", message: text, timestamp: Date.now() },
    ]);
  }, []);

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: "/api/socket.io",
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", { roomId, username: displayName });
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
      setUsername(data.username);
      setUsersOnline(data.usersOnline);
      setIsHost(data.isHost);
      setRoles(data.roles);
      setUsers(data.users);
      setFiles(data.files);
      setActiveFileId(data.activeFileId);
    });

    socket.on("user-joined", (data: { username: string; usersOnline: number; users: string[] }) => {
      setUsersOnline(data.usersOnline);
      setUsers(data.users);
      addSystemMessage(`${data.username} joined the room.`);
    });

    socket.on("user-left", (data: { username: string; usersOnline: number; users: string[] }) => {
      setUsersOnline(data.usersOnline);
      setUsers(data.users);
      addSystemMessage(`${data.username} left the room.`);
    });

    socket.on("user-count", (data: { usersOnline: number }) => setUsersOnline(data.usersOnline));

    // File system events
    socket.on("file-content-updated", (data: { fileId: string; code: string }) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === data.fileId ? { ...f, content: data.code } : f))
      );
    });

    socket.on("fs-updated", (data: { files: FileNode[]; newItemId?: string; deletedId?: string }) => {
      setFiles(data.files);
      // If active file was deleted, switch to first remaining file
      if (data.deletedId) {
        setActiveFileId((current) => {
          if (current === data.deletedId) {
            const firstFile = data.files.find((f) => f.type === "file");
            return firstFile?.id ?? null;
          }
          return current;
        });
      }
      // Auto-select newly created file
      if (data.newItemId) {
        const newItem = data.files.find((f) => f.id === data.newItemId);
        if (newItem?.type === "file") setActiveFileId(data.newItemId);
      }
    });

    socket.on("chat-message", (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg])
    );

    socket.on("roles-updated", (data: { roles: Record<string, Role>; users: string[] }) => {
      setRoles(data.roles);
      setUsers(data.users);
    });

    socket.on("host-transferred", () => {
      setIsHost(true);
      addSystemMessage("You are now the host of this room.");
    });

    return () => { socket.disconnect(); };
  }, [roomId, displayName, addSystemMessage]);

  const sendFileContentUpdate = useCallback((fileId: string, code: string) => {
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

  const myRole: Role = roles[username] ?? null;

  return {
    isConnected, usersOnline, username, files, activeFileId, setActiveFileId,
    messages, isHost, roles, users, myRole,
    sendFileContentUpdate, sendMessage, assignRole,
    createItem, deleteItem, renameItem,
  };
}
