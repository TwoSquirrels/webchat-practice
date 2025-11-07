"use client";

import { useState } from "react";
import useWebSocket from "react-use-websocket";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { sendMessage: wsSendMessage, readyState } = useWebSocket(
    "ws://localhost:3001/ws",
    {
      onMessage: (event) => {
        setMessages((prev) => [...prev, event.data]);
      },
    },
  );

  const sendMessage = () => {
    if (readyState === WebSocket.OPEN && input.trim()) {
      wsSendMessage(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          WebChat Practice
        </h1>
        <p className="text-center text-lg mb-4">
          WebSocketによるチャットサービスの練習用
        </p>

        {/* チャットUI */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">チャット</h2>
          <div className="h-64 overflow-y-auto bg-white dark:bg-gray-700 rounded p-4 mb-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                {msg}
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-2 border rounded-l"
              placeholder="メッセージを入力..."
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
            >
              送信
            </button>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">技術スタック</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Frontend: Next.js (SSG) + TypeScript + Tailwind CSS</li>
            <li>Backend: Hono + TypeScript</li>
            <li>Package Manager: pnpm workspaces</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
