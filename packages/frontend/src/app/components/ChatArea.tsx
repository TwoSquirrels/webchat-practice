"use client";

import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { ChatMessage, User } from "../types";

interface ChatAreaProps {
  currentRoomId: string | null;
  currentUser: User | null;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onCopyRoomUrl: () => void;
  authenticated: boolean;
  roomJoined: boolean;
  onCreateRoom: () => void;
  loading: boolean;
}

export default function ChatArea({
  currentRoomId,
  currentUser,
  messages,
  input,
  onInputChange,
  onSendMessage,
  onCopyRoomUrl,
  authenticated,
  roomJoined,
  onCreateRoom,
  loading,
}: ChatAreaProps) {
  if (!currentRoomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            WebChat Practice
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            左側のリストからルームを選択するか、新しいルームを作成してください。
          </p>
          <button
            onClick={onCreateRoom}
            disabled={loading}
            className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
            ) : (
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
            新しいルームを作成
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ChatHeader
        currentRoomId={currentRoomId}
        onCopyRoomUrl={onCopyRoomUrl}
        authenticated={authenticated}
        roomJoined={roomJoined}
      />
      <MessageList messages={messages} currentUser={currentUser} />
      <ChatInput
        input={input}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        authenticated={authenticated}
        roomJoined={roomJoined}
      />
    </>
  );
}
