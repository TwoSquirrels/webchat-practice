import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { cors } from "hono/cors";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import { findUserByGoogleId, findUserById, upsertUser } from "./db";
import { generateToken, verifyToken } from "./auth";
import {
  generateAuthCode,
  getUserByAuthCode,
  getMockUsers,
} from "./mockGoogle";

const app = new Hono();

// CORS設定
app.use("/*", cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));

// WebSocket接続を管理する配列（ユーザーIDとWSのマッピング）
interface AuthenticatedWebSocket {
  ws: WebSocket;
  userId: string;
  userName: string;
}

const clients: AuthenticatedWebSocket[] = [];

// WebSocketサポートを作成
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

// モックGoogleユーザーの一覧を取得
app.get("/api/mock-users", (c) => {
  return c.json({ users: getMockUsers() });
});

// モックGoogle OAuth認証開始
app.get("/auth/google", (c) => {
  const userIndex = Number(c.req.query("user_index") || "0");
  const code = generateAuthCode(userIndex);
  
  // フロントエンドのコールバックURLにリダイレクト
  const redirectUri = `http://localhost:3000/auth/callback?code=${code}`;
  return c.redirect(redirectUri);
});

// 認証コードをトークンに交換
app.post("/auth/token", async (c) => {
  const body = await c.req.json();
  const { code } = body;

  if (!code) {
    return c.json({ error: "Code is required" }, 400);
  }

  // 認証コードからユーザー情報を取得
  const googleUser = getUserByAuthCode(code);
  if (!googleUser) {
    return c.json({ error: "Invalid or expired code" }, 400);
  }

  // ユーザーをデータベースに作成または更新
  const userId = uuidv4();
  const user = await upsertUser(
    userId,
    googleUser.id,
    googleUser.email,
    googleUser.name,
    googleUser.picture,
  );

  // JWTトークンを生成
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

// ユーザー情報を取得
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

// WebSocketエンドポイント
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
        
        // 認証メッセージの処理
        if (data.type === "auth") {
          const payload = verifyToken(data.token);
          if (!payload) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
            ws.close();
            return;
          }

          const user = await findUserById(payload.userId);
          if (!user) {
            ws.send(JSON.stringify({ type: "error", message: "User not found" }));
            ws.close();
            return;
          }

          // 認証成功、クライアントリストに追加
          if (ws.raw) {
            clients.push({
              ws: ws.raw,
              userId: user.id,
              userName: user.name || user.email,
            });
          }

          ws.send(JSON.stringify({ type: "auth_success", user: { name: user.name || user.email } }));
          console.log(`User authenticated: ${user.email}`);
          return;
        }

        // 認証済みかチェック
        const client = ws.raw ? clients.find(c => c.ws === ws.raw) : null;
        if (!client) {
          ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
          return;
        }

        // チャットメッセージの処理
        if (data.type === "message") {
          const chatMessage = {
            type: "message",
            user: client.userName,
            text: data.text,
            timestamp: new Date().toISOString(),
          };

          // すべての認証済みクライアントにメッセージをブロードキャスト
          clients.forEach((c) => {
            if (c.ws.readyState === WebSocket.OPEN) {
              c.ws.send(JSON.stringify(chatMessage));
            }
          });
        }
      } catch (error) {
        console.error("Error parsing message:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    },
    onClose(_event, ws) {
      console.log("WebSocket connection closed");
      // 接続が閉じられたらクライアントを削除
      if (ws.raw) {
        const index = clients.findIndex(c => c.ws === ws.raw);
        if (index > -1) {
          clients.splice(index, 1);
        }
      }
    },
    onError(error) {
      console.error("WebSocket error:", error);
    },
  })),
);

const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

// サーバーを起動してWebSocketをインジェクト
const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
