"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function CallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  // 認証処理
  useEffect(() => {
    // 既に処理済みの場合はスキップ
    if (processedRef.current) return;

    if (!code) {
      setError("認証コードが見つかりません");
      processedRef.current = true;
      return;
    }

    processedRef.current = true;

    const handleAuth = async () => {
      try {
        const response = await fetch("http://localhost:3001/auth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `認証エラー: ${response.status}`);
        }

        const data = await response.json();

        // トークンとユーザー情報をlocalStorageに保存
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // チャットページにリダイレクト
        window.location.href = "/chat";
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Authentication error:", message);
        setError(message);
      }
    };

    handleAuth();
  }, [code]);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return <LoadingFallback />;
}

function LoadingFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-2xl font-bold text-center mb-4">認証中...</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          しばらくお待ちください
        </p>
      </div>
    </main>
  );
}

function ErrorFallback({ error }: { error: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-center mb-4 text-red-600 dark:text-red-400">
            認証エラー
          </h1>
          <p className="text-center text-red-700 dark:text-red-300 mb-4">
            {error}
          </p>
          <a
            href="/login"
            className="block text-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            ログインページに戻る
          </a>
        </div>
      </div>
    </main>
  );
}
