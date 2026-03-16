import { type Server as SocketIOServer } from "socket.io";

type Role = "driver" | "navigator" | null;

interface RoomState {
  code: string;
  users: Map<string, string>; // socketId → username
  hostSocketId: string | null;
  roles: Map<string, Role>; // username → role
}

const rooms = new Map<string, RoomState>();

function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: `// Welcome to 2gether Programming!\n// Room: ${roomId}\n// Start coding together...\n\nconsole.log("Hello, World!");\n`,
      users: new Map(),
      hostSocketId: null,
      roles: new Map(),
    });
  }
  return rooms.get(roomId)!;
}

function getRolesPayload(room: RoomState): Record<string, Role> {
  const out: Record<string, Role> = {};
  for (const [username, role] of room.roles.entries()) {
    out[username] = role;
  }
  return out;
}

function getUsersList(room: RoomState): string[] {
  return Array.from(room.users.values());
}

export function setupSocketHandlers(io: SocketIOServer) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    let currentRoomId: string | null = null;
    let currentUsername: string | null = null;

    socket.on("join-room", ({ roomId, username }: { roomId: string; username?: string }) => {
      currentRoomId = roomId;
      socket.join(roomId);

      const room = getOrCreateRoom(roomId);

      const userCount = room.users.size;
      const assignedUsername = username || (userCount === 0 ? "User1" : "User2");
      currentUsername = assignedUsername;
      room.users.set(socket.id, assignedUsername);

      // First to join is the host
      const isHost = room.hostSocketId === null;
      if (isHost) {
        room.hostSocketId = socket.id;
      }

      // Initialize role entry if not present
      if (!room.roles.has(assignedUsername)) {
        room.roles.set(assignedUsername, null);
      }

      socket.emit("room-joined", {
        username: assignedUsername,
        usersOnline: room.users.size,
        code: room.code,
        isHost,
        roles: getRolesPayload(room),
        users: getUsersList(room),
      });

      socket.to(roomId).emit("user-joined", {
        username: assignedUsername,
        usersOnline: room.users.size,
        users: getUsersList(room),
      });

      io.to(roomId).emit("user-count", { usersOnline: room.users.size });
    });

    socket.on("code-change", ({ roomId, code }: { roomId: string; code: string }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.code = code;
        socket.to(roomId).emit("code-update", { code });
      }
    });

    socket.on("send-message", ({ roomId, message }: { roomId: string; message: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const senderUsername = room.users.get(socket.id);
      const chatMessage = {
        id: Date.now().toString(),
        username: senderUsername || "Unknown",
        message,
        timestamp: Date.now(),
      };
      socket.to(roomId).emit("chat-message", chatMessage);
    });

    socket.on("assign-role", ({
      roomId,
      username,
      role,
    }: {
      roomId: string;
      username: string;
      role: Role;
    }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Only the host can assign roles
      if (room.hostSocketId !== socket.id) return;

      // Enforce: only one driver and one navigator at a time
      if (role === "driver" || role === "navigator") {
        for (const [uname, existingRole] of room.roles.entries()) {
          if (existingRole === role) {
            room.roles.set(uname, null);
          }
        }
      }

      room.roles.set(username, role);

      // Broadcast updated roles to everyone in the room
      io.to(roomId).emit("roles-updated", {
        roles: getRolesPayload(room),
        users: getUsersList(room),
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      if (currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          room.users.delete(socket.id);

          // If host left, transfer host to next user (if any)
          if (room.hostSocketId === socket.id) {
            const nextSocketId = room.users.keys().next().value;
            room.hostSocketId = nextSocketId ?? null;
            if (nextSocketId) {
              io.to(nextSocketId).emit("host-transferred", { isHost: true });
            }
          }

          io.to(currentRoomId).emit("user-left", {
            username: currentUsername,
            usersOnline: room.users.size,
            users: getUsersList(room),
          });
          io.to(currentRoomId).emit("user-count", { usersOnline: room.users.size });

          if (room.users.size === 0) {
            setTimeout(() => {
              const r = rooms.get(currentRoomId!);
              if (r && r.users.size === 0) {
                rooms.delete(currentRoomId!);
              }
            }, 5 * 60 * 1000);
          }
        }
      }
    });
  });
}
