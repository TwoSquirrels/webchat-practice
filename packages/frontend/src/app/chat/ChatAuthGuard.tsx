"use client";

import { useRef, useEffect, useState } from "react";
import ChatContent from "./ChatContent";

/**
 * チャットページの認証ガード
 * トークンをチェックして、なければログインページへのリンクを表示
 */
export function ChatAuthGuard() {
  const initialized = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setIsAuthenticated(!!storedToken);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <div className="p-8">チェック中...</div>;
  }

  if (!isAuthenticated || !token) {
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
