import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const app = new Hono();

// WebSocket接続を管理する配列
const clients: WebSocket[] = [];

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

const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

// HTTPサーバーを作成
const server = createServer();

// HonoをHTTPサーバーにマウント
server.on("request", (req, res) => {
  app
    .fetch(
      new Request(`http://localhost:${port}${req.url}`, {
        method: req.method,
        headers: req.headers as any,
        body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
      })
    )
    .then(async (response) => {
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      if (response.body) {
        res.write(await response.arrayBuffer());
      }
      res.end();
    })
    .catch((err) => {
      console.error(err);
      res.statusCode = 500;
      res.end();
    });
});

// WebSocketサーバーを追加
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("WebSocket connection opened");
  clients.push(ws);

  ws.onmessage = (event: MessageEvent) => {
    const message = event.data.toString();
    console.log("Received message:", message);

    // すべてのクライアントにメッセージをブロードキャスト
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
    // 接続が閉じられたらクライアントを削除
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
  };

  ws.onerror = (error: Event) => {
    console.error("WebSocket error:", error);
  };
});

server.listen(port);
