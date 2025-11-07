"use client";

import { useAtomValue } from "jotai";
import ChatContent from "./ChatContent";
import { tokenAtom } from "./chatStore";

/**
 * チャットページの認証ガード
 * Jotai の tokenAtom を使用してトークンをチェック
 */
export function ChatAuthGuard() {
  const token = useAtomValue(tokenAtom);

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="mb-6 text-gray-600">
            チャットを利用するにはログインしてください。
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  return <ChatContent token={token} initialUser={null} />;
}
