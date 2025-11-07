import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { cors } from "hono/cors";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import {
  findUserByGoogleId,
  findUserById,
  upsertUser,
  createRoom,
  findRoomById,
  joinRoom,
  getUserRoomHistory,
  getRoomMessages,
  saveMessage,
} from "./db";
import { generateToken, verifyToken } from "./auth";
import {
  generateAuthCode,
  getUserByAuthCode,
  getMockUsers,
} from "./mockGoogle";

const app = new Hono();

/**
 * CORS 設定
 * フロントエンド (localhost:3000) からのリクエストを許可
 */
app.use(
  "/*",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

/**
 * WebSocket クライアント管理
 * 認証済みユーザーとコネクションのマッピング (ルームIDも含む)
 */
interface AuthenticatedWebSocket {
  ws: WebSocket;
  userId: string;
  userName: string;
  roomId?: string;
}

const clients: AuthenticatedWebSocket[] = [];

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get("/", (c) => {
  return c.json({
    message: "WebChat Practice API",
    version: "0.1.0",
    description: "Backend API for WebSocket chat service practice",
  });
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * GET /api/mock-users
 * テストユーザー一覧を返す
 */
app.get("/api/mock-users", (c) => {
  return c.json({ users: getMockUsers() });
});

/**
 * GET /auth/google
 * OAuth フロー開始
 * 認証コード生成 → /auth/callback にリダイレクト
 */
app.get("/auth/google", (c) => {
  const userIndex = Number(c.req.query("user_index") || "0");
  const code = generateAuthCode(userIndex);
  const redirectUri = `http://localhost:3000/auth/callback?code=${code}`;
  return c.redirect(redirectUri);
});

/**
 * POST /auth/token
 * 認証コードをトークンに交換
 * コード: 一度だけ使用可能、15分で有効期限切れ
 */
app.post("/auth/token", async (c) => {
  const body = await c.req.json();
  const { code } = body;

  if (!code) {
    return c.json({ error: "Code is required" }, 400);
  }

  const googleUser = getUserByAuthCode(code);
  if (!googleUser) {
    return c.json({ error: "Invalid or expired code" }, 400);
  }

  const userId = uuidv4();
  const user = await upsertUser(
    userId,
    googleUser.id,
    googleUser.email,
    googleUser.name,
    googleUser.picture
  );

  const token = generateToken(user.id, user.email);

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
});

/**
 * GET /api/user
 * Bearer トークンからユーザー情報を取得
 */
app.get("/api/user", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  });
});

/**
 * POST /api/rooms
 * 新しいルームを作成 (UUID を roomId として使用)
 */
app.post("/api/rooms", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const roomId = uuidv4();
  const room = await createRoom(roomId);

  return c.json({ room: { id: room.id, createdAt: room.createdAt } });
});

/**
 * POST /api/rooms/:roomId/join
 * ルームに参加
 */
app.post("/api/rooms/:roomId/join", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const roomId = c.req.param("roomId");

  // ルームが存在するか確認、なければ作成
  let room = await findRoomById(roomId);
  if (!room) {
    room = await createRoom(roomId);
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

/**
 * GET /api/rooms/history
 * ユーザーのルーム参加履歴を取得
 */
app.get("/api/rooms/history", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

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

/**
 * GET /api/rooms/:roomId/messages
 * ルームのメッセージ履歴を取得
 */
app.get("/api/rooms/:roomId/messages", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

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
});

/**
 * WS /ws
 * リアルタイムチャット WebSocket (ルーム機能付き)
 * 1. 接続後、auth メッセージでトークン検証
 * 2. 認証成功後、クライアントリストに追加
 * 3. join_room メッセージでルームに参加
 * 4. message メッセージを同じルームのクライアントにブロードキャスト
 * 5. 接続切断時はクライアントリストから削除
 */
app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      console.log("WebSocket connection opened (pending authentication)");
    },
    async onMessage(event, ws) {
      const message = event.data.toString();

      try {
        const data = JSON.parse(message);

        if (data.type === "auth") {
          const payload = verifyToken(data.token);
          if (!payload) {
            ws.send(
              JSON.stringify({ type: "error", message: "Invalid token" })
            );
            ws.close();
            return;
          }

          const user = await findUserById(payload.userId);
          if (!user) {
            ws.send(
              JSON.stringify({ type: "error", message: "User not found" })
            );
            ws.close();
            return;
          }

          // 認証成功: clients に追加してメッセージ受信可能に
          if (ws.raw) {
            clients.push({
              ws: ws.raw,
              userId: user.id,
              userName: user.name || user.email,
            });
          }

          ws.send(
            JSON.stringify({
              type: "auth_success",
              user: { name: user.name || user.email },
            })
          );
          console.log(`User authenticated: ${user.email}`);
          return;
        }

        // 認証済みクライアントか確認
        const client = ws.raw ? clients.find((c) => c.ws === ws.raw) : null;
        if (!client) {
          ws.send(
            JSON.stringify({ type: "error", message: "Not authenticated" })
          );
          return;
        }

        // ルームに参加
        if (data.type === "join_room") {
          const roomId = data.roomId;
          if (!roomId) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room ID is required" })
            );
            return;
          }

          // ルームが存在するか確認、なければ作成
          let room = await findRoomById(roomId);
          if (!room) {
            room = await createRoom(roomId);
          }

          // クライアントにルームIDを設定
          client.roomId = roomId;

          // ルームに参加記録
          const participantId = uuidv4();
          await joinRoom(participantId, roomId, client.userId);

          // ルームのメッセージ履歴を取得して送信
          const messages = await getRoomMessages(roomId);

          ws.send(
            JSON.stringify({
              type: "room_joined",
              roomId: roomId,
              messages: messages.map((m) => ({
                type: "message",
                user: m.user.name || m.user.email,
                text: m.text,
                timestamp: m.createdAt.toISOString(),
              })),
            })
          );
          console.log(`User ${client.userName} joined room ${roomId}`);
          return;
        }

        // メッセージを同じルームの認証済みクライアントにブロードキャスト
        if (data.type === "message") {
          if (!client.roomId) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Not in a room. Please join a room first.",
              })
            );
            return;
          }

          const timestamp = new Date();
          const chatMessage = {
            type: "message",
            user: client.userName,
            text: data.text,
            timestamp: timestamp.toISOString(),
          };

          // データベースにメッセージを保存
          const messageId = uuidv4();
          await saveMessage(
            messageId,
            client.roomId,
            client.userId,
            data.text
          );

          // 同じルームのクライアントにブロードキャスト
          clients.forEach((c) => {
            if (
              c.ws.readyState === WebSocket.OPEN &&
              c.roomId === client.roomId
            ) {
              c.ws.send(JSON.stringify(chatMessage));
            }
          });
        }
      } catch (error) {
        console.error("Error parsing message:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    },
    onClose(_event, ws) {
      console.log("WebSocket connection closed");
      // クライアントリストから削除
      if (ws.raw) {
        const index = clients.findIndex((c) => c.ws === ws.raw);
        if (index > -1) {
          clients.splice(index, 1);
        }
      }
    },
    onError(error) {
      console.error("WebSocket error:", error);
    },
  }))
);

const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
