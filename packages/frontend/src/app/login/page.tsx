"use client";

import { useState } from "react";

interface MockUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export default function LoginPage() {
  const [mockUsers, setMockUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/mock-users");
      const data = await response.json();
      setMockUsers(data.users);
    } catch (error) {
      console.error("Failed to load mock users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userIndex: number) => {
    // モックGoogle OAuthフローを開始
    window.location.href = `http://localhost:3001/auth/google?user_index=${userIndex}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          WebChat Practice
        </h1>
        <p className="text-center text-lg mb-8">
          ログインしてチャットを始めましょう
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            モックGoogle認証
          </h2>
          
          {mockUsers.length === 0 ? (
            <button
              onClick={handleLoadUsers}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "読み込み中..." : "ログインする"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ログインするユーザーを選択してください:
              </p>
              {mockUsers.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(index)}
                  className="w-full px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-3"
                >
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-3">説明</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            このアプリケーションは、実際のGoogle
            OAuthの代わりにモックサーバーを使用しています。
            上のボタンをクリックして、テストユーザーでログインしてください。
          </p>
        </div>
      </div>
    </main>
  );
}
