"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { useSearchParams } from "next/navigation";
import ChatContent from "./ChatContent";
import { tokenAtom } from "../chatStore";

/**
 * チャットページの認証ガード
 * Jotai の tokenAtom を使用してトークンをチェック
 * 未認証時は自動的にログインページにリダイレクト
 */
export function ChatAuthGuard() {
  const token = useAtomValue(tokenAtom);
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // クライアント側でのみ実行
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // トークンがない場合はリダイレクト
    if (!token) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }, [isReady, token]);

  // 初期化完了＆トークンがない場合はローディング表示
  if (!isReady || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">認証を確認しています...</p>
        </div>
      </div>
    );
  }

  const urlRoomId = searchParams.get("room");

  return <ChatContent token={token} initialUser={null} urlRoomId={urlRoomId} />;
}
