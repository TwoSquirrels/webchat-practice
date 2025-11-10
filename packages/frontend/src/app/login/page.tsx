"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface MockUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [mockUsers, setMockUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // リダイレクトパラメータを取得
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, [searchParams]);

  const handleLoadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/api/mock-users");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      setMockUsers(data.users);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "ユーザーの読み込みに失敗しました";
      console.error("Failed to load mock users:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userIndex: number) => {
    // リダイレクト先をクエリパラメータとして渡す
    const params = new URLSearchParams({
      user_index: userIndex.toString(),
    });
    if (redirectPath) {
      params.set("redirect", redirectPath);
    }
    window.location.href = `http://localhost:3001/auth/google?${params.toString()}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            WebChat Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ログインしてチャットを始めましょう
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
            Googleでログイン
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {mockUsers.length === 0 ? (
            <button
              onClick={handleLoadUsers}
              disabled={loading}
              className="w-full px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  読み込み中...
                </div>
              ) : (
                "ログインする"
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                ログインするユーザーを選択してください:
              </p>
              {mockUsers.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(index)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md transition-all duration-200 flex items-center gap-3 group"
                >
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            説明
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            このアプリケーションは、実際のGoogle
            OAuthの代わりにモックサーバーを使用しています。上記のボタンをクリックして、テストユーザーでログインしてください。
          </p>
        </div>
      </div>
    </main>
  );
}
