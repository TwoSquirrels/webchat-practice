import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import WebSocket from "ws";

const app = new Hono();

// WebSocket接続を管理する配列
const clients: WebSocket[] = [];

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

// WebSocketエンドポイント
app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      console.log("WebSocket connection opened");
      if (ws.raw) {
        clients.push(ws.raw);
      }
    },
    onMessage(event, ws) {
      const message = event.data.toString();
      console.log("Received message:", message);

      // すべてのクライアントにメッセージをブロードキャスト
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    },
    onClose(_event, ws) {
      console.log("WebSocket connection closed");
      // 接続が閉じられたらクライアントを削除
      if (ws.raw) {
        const index = clients.indexOf(ws.raw);
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
