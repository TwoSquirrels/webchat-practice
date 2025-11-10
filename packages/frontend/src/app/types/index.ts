// フロントエンド共通型定義

export interface ChatMessage {
  type: string;
  user?: string;
  text?: string;
  timestamp?: string;
}

export interface Room {
  id: string;
  lastAccessAt: string;
}

export interface User {
  name: string;
  id?: string;
  email?: string;
}
