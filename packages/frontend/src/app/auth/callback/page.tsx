"use client";

import { Suspense } from "react";
import { useCallbackAuth } from "./useCallbackAuth";

/**
 * OAuth コールバック認証ページ
 * useCallbackAuth Hook でロジックを分離
 */
function CallbackContent() {
  const { error } = useCallbackAuth();

  if (error) {
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
