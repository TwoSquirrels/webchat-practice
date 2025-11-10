// WebSocket メッセージ型定義（Union 型）

interface AuthMessage {
  type: "auth";
  token: string;
}

interface JoinRoomMessage {
  type: "join_room";
  roomId: string;
}

interface ChatMessage {
  type: "message";
  text: string;
}

export type IncomingMessage = AuthMessage | JoinRoomMessage | ChatMessage;

export interface OutgoingAuthSuccess {
  type: "auth_success";
  user: { name: string };
}

export interface OutgoingRoomJoined {
  type: "room_joined";
  roomId: string;
  messages: Array<{
    type: "message";
    user: string;
    text: string;
    timestamp: string;
  }>;
}

export interface OutgoingMessage {
  type: "message";
  user: string;
  text: string;
  timestamp: string;
}

export interface OutgoingError {
  type: "error";
  message: string;
}

export type OutgoingMessageType =
  | OutgoingAuthSuccess
  | OutgoingRoomJoined
  | OutgoingMessage
  | OutgoingError;

// API レスポンス型

export interface ApiErrorResponse {
  error: string;
}

export interface ApiSuccessResponse<T> {
  [key: string]: T;
}
