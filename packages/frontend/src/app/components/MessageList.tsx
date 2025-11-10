import { useRef, useEffect } from "react";
import type { ChatMessage, User } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: User | null;
}

export function MessageList({ messages, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50">
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
            <p className="text-sm">最初のメッセージを送ってみましょう！</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
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
                    {msg.user || "Anonymous"}
                  </span>
                  {msg.timestamp && (
                    <span
                      className={`text-xs ${
                        msg.user === currentUser?.name
                          ? "text-blue-200"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <div className="text-sm">{msg.text || "(空のメッセージ)"}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
