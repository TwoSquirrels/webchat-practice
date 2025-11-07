"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // クライアントサイドでトークンをチェックしてリダイレクト
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          WebChat Practice
        </h1>
        <p className="text-center text-lg">リダイレクト中...</p>
      </div>
    </main>
  );
}
