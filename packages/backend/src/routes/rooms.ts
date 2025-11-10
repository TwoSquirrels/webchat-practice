import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import {
  createRoom,
  findRoomById,
  joinRoom,
  getUserRoomHistory,
  getRoomMessages,
  prisma,
} from "../db";
import { verifyAuthMiddleware, getAuthPayload } from "../middleware/auth";

const roomsRouter = new Hono();

roomsRouter.post("/api/rooms", verifyAuthMiddleware, async (c) => {
  const roomId = uuidv4();
  const room = await createRoom(roomId);
  return c.json({ room: { id: room.id, createdAt: room.createdAt } });
});

roomsRouter.post("/api/rooms/:roomId/join", verifyAuthMiddleware, async (c) => {
  const payload = getAuthPayload(c);
  const roomId = c.req.param("roomId");
  const room = await findRoomById(roomId);

  if (!room) {
    return c.json({ error: "Room not found" }, 404);
  }

  const participantId = uuidv4();
  const participant = await joinRoom(participantId, roomId, payload.userId);

  return c.json({
    room: { id: room.id, createdAt: room.createdAt },
    participant: {
      joinedAt: participant.joinedAt,
      lastAccessAt: participant.lastAccessAt,
    },
  });
});

roomsRouter.get("/api/rooms/history", verifyAuthMiddleware, async (c) => {
  const payload = getAuthPayload(c);
  const history = await getUserRoomHistory(payload.userId);

  return c.json({
    rooms: history.map((h) => ({
      id: h.room.id,
      joinedAt: h.joinedAt,
      lastAccessAt: h.lastAccessAt,
      createdAt: h.room.createdAt,
    })),
  });
});

roomsRouter.get(
  "/api/rooms/:roomId/messages",
  verifyAuthMiddleware,
  async (c) => {
    const roomId = c.req.param("roomId");
    const messages = await getRoomMessages(roomId);

    return c.json({
      messages: messages.map((m) => ({
        id: m.id,
        text: m.text,
        user: m.user.name || m.user.email,
        timestamp: m.createdAt.toISOString(),
      })),
    });
  }
);

roomsRouter.get(
  "/api/rooms/:roomId/status",
  verifyAuthMiddleware,
  async (c) => {
    const payload = getAuthPayload(c);
    const roomId = c.req.param("roomId");
    const room = await findRoomById(roomId);

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    const participant = await prisma.roomParticipant.findFirst({
      where: {
        roomId: roomId,
        userId: payload.userId,
      },
    });

    return c.json({
      roomId: room.id,
      exists: true,
      isJoined: !!participant,
      joinedAt: participant?.joinedAt?.toISOString(),
      lastAccessAt: participant?.lastAccessAt?.toISOString(),
    });
  }
);

export default roomsRouter;
