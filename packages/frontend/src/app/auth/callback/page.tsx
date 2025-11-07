"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  // React 19以前の方法で、イベントハンドラ内で非同期処理を実行
  const handleAuth = async () => {
    if (!code) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }

      const data = await response.json();
      
      // トークンとユーザー情報をlocalStorageに保存
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // チャットページにリダイレクト
      router.push("/chat");
    } catch (error) {
      console.error("Authentication error:", error);
      router.push("/login");
    }
  };

  // コンポーネントマウント時に認証処理を実行（useEffectの代わり）
  // React 19ではuseEffectの代わりにこのパターンを使用可能
  if (typeof window !== "undefined" && !sessionStorage.getItem("auth_processed")) {
    sessionStorage.setItem("auth_processed", "true");
    handleAuth();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-2xl font-bold text-center mb-4">
          認証中...
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          しばらくお待ちください
        </p>
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm">
          <h1 className="text-2xl font-bold text-center mb-4">
            読み込み中...
          </h1>
        </div>
      </main>
    }>
      <CallbackContent />
    </Suspense>
  );
}
