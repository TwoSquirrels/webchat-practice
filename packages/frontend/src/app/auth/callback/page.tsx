"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

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

    handleAuth();
  }, [code, router]);

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

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm">
            <h1 className="text-2xl font-bold text-center mb-4">
              読み込み中...
            </h1>
          </div>
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
