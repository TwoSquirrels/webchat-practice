"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // クライアントサイドでトークンをチェックしてリダイレクト
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 animate-pulse"></div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            WebChat Practice
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            リアルタイムチャットアプリケーション
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">リダイレクト中...</p>
        </div>
      </div>
    </main>
  );
}
