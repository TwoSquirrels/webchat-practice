"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser({ name: user.name || user.email });
    }
  }, [router]);

  // WebSocket接続
  const { sendJsonMessage, readyState } = useWebSocket(
    token ? "ws://localhost:3001/ws" : null,
    {
      onOpen: () => {
        console.log("WebSocket connected");
        // 認証トークンを送信
        if (token) {
          sendJsonMessage({ type: "auth", token });
        }
      },
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "auth_success") {
            setAuthenticated(true);
            if (data.user?.name) {
              setCurrentUser({ name: data.user.name });
            }
          } else if (data.type === "message") {
            setMessages((prev) => [...prev, data]);
          } else if (data.type === "error") {
            console.error("WebSocket error:", data.message);
            if (
              data.message.includes("token") ||
              data.message.includes("authenticated")
            ) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
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
    }
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

  // クライアントサイドでない場合はローディング表示
  if (!isClient) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 animate-pulse"></div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            WebChat Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WebChat Practice
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              リアルタイムチャット
            </p>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span>ログイン中: {currentUser.name}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* チャットUI */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              チャットルーム
            </h2>
            {!authenticated && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
                  <span className="text-yellow-800 dark:text-yellow-200">
                    認証中...
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>メッセージがありません</p>
                  <p className="text-sm">
                    最初のメッセージを送ってみましょう！
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.user === currentUser?.name ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        msg.user === currentUser?.name
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-medium text-sm ${
                            msg.user === currentUser?.name
                              ? "text-blue-100"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {msg.user}
                        </span>
                        {msg.timestamp && (
                          <span
                            className={`text-xs ${
                              msg.user === currentUser?.name
                                ? "text-blue-200"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString(
                              "ja-JP",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-sm">{msg.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!authenticated}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                placeholder={
                  authenticated ? "メッセージを入力..." : "認証中..."
                }
              />
              <button
                onClick={sendMessage}
                disabled={!authenticated || !input.trim()}
                className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                送信
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
