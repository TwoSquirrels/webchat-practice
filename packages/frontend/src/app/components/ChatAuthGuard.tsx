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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // コンポーネントマウント時に一度だけ実行
    if (isInitialized) return;

    // localStorage から直接トークンをチェック
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      // トークンがない場合はリダイレクト
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }

    // トークンがある場合は初期化完了
    setIsInitialized(true);
  }, [isInitialized]);

  // 初期化が完了していない、またはトークンがない場合はローディング表示
  if (!isInitialized || !token) {
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
