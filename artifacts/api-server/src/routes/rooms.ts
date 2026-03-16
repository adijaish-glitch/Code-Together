import { Router, type IRouter } from "express";
import { CreateRoomBody, CreateRoomResponse, GetRoomParams, GetRoomResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const roomRegistry = new Map<string, { roomId: string; createdAt: string }>();

router.post("/rooms", (req, res) => {
  const parsed = CreateRoomBody.safeParse(req.body);
  let roomId: string;

  if (parsed.success && parsed.data.roomId) {
    roomId = parsed.data.roomId;
  } else {
    roomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  if (!roomRegistry.has(roomId)) {
    roomRegistry.set(roomId, { roomId, createdAt: new Date().toISOString() });
  }

  const room = roomRegistry.get(roomId)!;
  const data = CreateRoomResponse.parse({
    roomId: room.roomId,
    createdAt: room.createdAt,
    userCount: 0,
  });
  res.json(data);
});

router.get("/rooms/:roomId", (req, res) => {
  const params = GetRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid room ID" });
    return;
  }

  const { roomId } = params.data;
  if (!roomRegistry.has(roomId)) {
    roomRegistry.set(roomId, { roomId, createdAt: new Date().toISOString() });
  }

  const room = roomRegistry.get(roomId)!;
  const data = GetRoomResponse.parse({
    roomId: room.roomId,
    createdAt: room.createdAt,
    userCount: 0,
  });
  res.json(data);
});

export default router;
