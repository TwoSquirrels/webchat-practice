import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";
import { verifyToken } from "../auth";
import {
  findUserById,
  joinRoom,
  findRoomById,
  getRoomMessages,
  saveMessage,
} from "../db";
import type {
  IncomingMessage,
  OutgoingMessageType,
  OutgoingAuthSuccess,
  OutgoingRoomJoined,
  OutgoingMessage,
  OutgoingError,
} from "../types";

export interface AuthenticatedWebSocket {
  ws: WebSocket;
  userId: string;
  userName: string;
  roomId?: string;
}

export const clients: AuthenticatedWebSocket[] = [];

function sendMessage(ws: WebSocket, message: OutgoingMessageType) {
  try {
    ws.send(JSON.stringify(message));
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}

function parseMessage(data: string): IncomingMessage | null {
  try {
    return JSON.parse(data) as IncomingMessage;
  } catch {
    return null;
  }
}

export function createWebSocketRoute(upgradeWebSocket: any, app: Hono) {
  app.get(
    "/ws",
    upgradeWebSocket(() => ({
      onOpen(_event: any, ws: any) {
        console.log("WebSocket connection opened (pending authentication)");
      },
      async onMessage(event: any, ws: any) {
        const rawMessage = event.data.toString();
        const data = parseMessage(rawMessage);

        if (!data) {
          const error: OutgoingError = {
            type: "error",
            message: "Invalid message format",
          };
          sendMessage(ws, error);
          return;
        }

        try {
          if (data.type === "auth") {
            const payload = verifyToken(data.token);
            if (!payload) {
              const error: OutgoingError = {
                type: "error",
                message: "Invalid token",
              };
              sendMessage(ws, error);
              ws.close();
              return;
            }

            const user = await findUserById(payload.userId);
            if (!user) {
              const error: OutgoingError = {
                type: "error",
                message: "User not found",
              };
              sendMessage(ws, error);
              ws.close();
              return;
            }

            if (ws.raw) {
              clients.push({
                ws: ws.raw,
                userId: user.id,
                userName: user.name || user.email,
              });
            }

            const success: OutgoingAuthSuccess = {
              type: "auth_success",
              user: { name: user.name || user.email },
            };
            sendMessage(ws, success);
            console.log(`User authenticated: ${user.email}`);
            return;
          }

          const client = ws.raw ? clients.find((c) => c.ws === ws.raw) : null;
          if (!client) {
            const error: OutgoingError = {
              type: "error",
              message: "Not authenticated",
            };
            sendMessage(ws, error);
            return;
          }

          if (data.type === "join_room") {
            const roomId = data.roomId;
            const room = await findRoomById(roomId);
            if (!room) {
              const error: OutgoingError = {
                type: "error",
                message: "Room not found",
              };
              sendMessage(ws, error);
              return;
            }

            client.roomId = roomId;
            const participantId = uuidv4();
            await joinRoom(participantId, roomId, client.userId);
            const messages = await getRoomMessages(roomId);

            const joined: OutgoingRoomJoined = {
              type: "room_joined",
              roomId: roomId,
              messages: messages.map((m) => ({
                type: "message",
                user: m.user.name || m.user.email,
                text: m.text,
                timestamp: m.createdAt.toISOString(),
              })),
            };
            sendMessage(ws, joined);
            console.log(`User ${client.userName} joined room ${roomId}`);
            return;
          }

          if (data.type === "message") {
            if (!client.roomId) {
              const error: OutgoingError = {
                type: "error",
                message: "Not in a room. Please join a room first.",
              };
              sendMessage(ws, error);
              return;
            }

            const timestamp = new Date();
            const chatMessage: OutgoingMessage = {
              type: "message",
              user: client.userName,
              text: data.text,
              timestamp: timestamp.toISOString(),
            };

            const messageId = uuidv4();
            await saveMessage(
              messageId,
              client.roomId,
              client.userId,
              data.text
            );

            clients.forEach((c) => {
              if (
                c.ws.readyState === WebSocket.OPEN &&
                c.roomId === client.roomId
              ) {
                sendMessage(c.ws, chatMessage);
              }
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
          const err: OutgoingError = {
            type: "error",
            message: "Internal server error",
          };
          sendMessage(ws, err);
        }
      },
      onClose(_event: any, ws: any) {
        console.log("WebSocket connection closed");
        if (ws.raw) {
          const index = clients.findIndex((c) => c.ws === ws.raw);
          if (index > -1) {
            clients.splice(index, 1);
          }
        }
      },
      onError(error: any) {
        console.error("WebSocket error:", error);
      },
    }))
  );
}
