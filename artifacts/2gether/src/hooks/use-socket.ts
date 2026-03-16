import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type Role = "driver" | "navigator" | null;

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export function useSocket(roomId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [usersOnline, setUsersOnline] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [code, setCode] = useState("// Write your code here...\nconsole.log('Hello, 2gether Programming!');");
  const [username, setUsername] = useState("Developer");
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
      socket.emit("join-room", { roomId });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("room-joined", (data: {
      username: string;
      usersOnline: number;
      code?: string;
      isHost: boolean;
      roles: Record<string, Role>;
      users: string[];
    }) => {
      setUsername(data.username);
      setUsersOnline(data.usersOnline);
      if (data.code) setCode(data.code);
      setIsHost(data.isHost);
      setRoles(data.roles);
      setUsers(data.users);
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

    socket.on("code-update", (data: { code: string }) => setCode(data.code));

    socket.on("chat-message", (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg])
    );

    socket.on("roles-updated", (data: { roles: Record<string, Role>; users: string[] }) => {
      setRoles(data.roles);
      setUsers(data.users);
    });

    socket.on("host-transferred", (data: { isHost: boolean }) => {
      setIsHost(data.isHost);
      addSystemMessage("You are now the host of this room.");
    });

    return () => { socket.disconnect(); };
  }, [roomId, addSystemMessage]);

  const sendCodeUpdate = useCallback((newCode: string) => {
    setCode(newCode);
    if (socketRef.current?.connected) {
      socketRef.current.emit("code-change", { roomId, code: newCode });
    }
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
    if (socketRef.current?.connected) {
      socketRef.current.emit("send-message", { roomId, message: text.trim() });
    }
  }, [roomId, username]);

  const assignRole = useCallback((targetUsername: string, role: Role) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("assign-role", { roomId, username: targetUsername, role });
    }
  }, [roomId]);

  const myRole: Role = roles[username] ?? null;

  return {
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
  };
}
