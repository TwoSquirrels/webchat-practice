import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { cors } from "hono/cors";
import authRouter from "./routes/auth";
import roomsRouter from "./routes/rooms";
import { createWebSocketRoute } from "./routes/websocket";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

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

app.route("/", authRouter);
app.route("/", roomsRouter);

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
createWebSocketRoute(upgradeWebSocket, app);

const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
