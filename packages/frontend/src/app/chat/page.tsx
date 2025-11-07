"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useWebSocket from "react-use-websocket";

interface ChatMessage {
  type: string;
  user?: string;
  text?: string;
  timestamp?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);

  // トークンとユーザー情報を取得
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const getUserInfo = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  // WebSocket接続
  const { sendJsonMessage, readyState } = useWebSocket(
    "ws://localhost:3001/ws",
    {
      onOpen: () => {
        console.log("WebSocket connected");
        // 認証トークンを送信
        const token = getToken();
        if (token) {
          sendJsonMessage({ type: "auth", token });
        } else {
          router.push("/login");
        }
      },
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "auth_success") {
            setAuthenticated(true);
            setCurrentUser(data.user);
          } else if (data.type === "message") {
            setMessages((prev) => [...prev, data]);
          } else if (data.type === "error") {
            console.error("WebSocket error:", data.message);
            if (data.message.includes("token") || data.message.includes("authenticated")) {
              router.push("/login");
            }
          }
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      },
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    },
  );

  const sendMessage = useCallback(() => {
    if (readyState === WebSocket.OPEN && authenticated && input.trim()) {
      sendJsonMessage({ type: "message", text: input });
      setInput("");
    }
  }, [readyState, authenticated, input, sendJsonMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // 認証チェック（ログインページへのリダイレクト）
  if (typeof window !== "undefined" && !getToken()) {
    router.push("/login");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">WebChat Practice</h1>
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="text-sm">ログイン中: {currentUser.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* チャットUI */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">チャット</h2>
          
          {!authenticated && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded text-center">
              認証中...
            </div>
          )}
          
          <div className="h-96 overflow-y-auto bg-white dark:bg-gray-700 rounded p-4 mb-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-3 p-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {msg.user}
                  </span>
                  {msg.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString("ja-JP")}
                    </span>
                  )}
                </div>
                <div className="mt-1">{msg.text}</div>
              </div>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!authenticated}
              className="flex-1 p-2 border rounded-l disabled:opacity-50"
              placeholder={authenticated ? "メッセージを入力..." : "認証中..."}
            />
            <button
              onClick={sendMessage}
              disabled={!authenticated}
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">技術スタック</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Frontend: Next.js + TypeScript + Tailwind CSS</li>
            <li>Backend: Hono + TypeScript</li>
            <li>Database: SQLite (better-sqlite3)</li>
            <li>Auth: JWT + Mock Google OAuth</li>
            <li>WebSocket: @hono/node-ws</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
