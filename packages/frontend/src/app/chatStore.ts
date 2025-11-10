import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

/**
 * チャット関連の Atom (状態管理)
 * Jotai を使用した状態管理
 * `atomWithStorage` で修飾した Atom は自動的に localStorage に永続化
 */

interface User {
  name: string;
}

interface ChatMessage {
  type: string;
  user?: string;
  text?: string;
  timestamp?: string;
}

interface Room {
  id: string;
  joinedAt: string;
  lastAccessAt: string;
  createdAt: string;
}

/**
 * JWT トークン
 * 認証後にバックエンドから取得し、自動的に localStorage に保存
 */
export const tokenAtom = atomWithStorage<string | null>("token", null);

/**
 * 現在のユーザー情報
 * WebSocket 認証成功後にバックエンドから取得
 */
export const currentUserAtom = atomWithStorage<User | null>("user", null);

/**
 * 現在のルームID
 * ユーザーが参加しているルームのID
 */
export const currentRoomIdAtom = atomWithStorage<string | null>(
  "currentRoomId",
  null
);

/**
 * ルーム参加履歴
 * ユーザーが参加したことのあるルームのリスト
 */
export const roomHistoryAtom = atomWithStorage<Room[]>("roomHistory", []);

/**
 * チャットメッセージ履歴
 * セッション中のみ保持 (メモリに存在)
 */
export const messagesAtom = atom<ChatMessage[]>([]);

/**
 * WebSocket 認証状態
 */
export const authenticatedAtom = atom(false);

/**
 * ルーム参加状態
 */
export const roomJoinedAtom = atom(false);

/**
 * チャット入力フィールドの現在値
 * ユーザーがメッセージを送信するまで保持
 */
export const chatInputAtom = atom("");
