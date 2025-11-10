"use client";

import { useState, useCallback } from "react";

interface Room {
  id: string;
  lastAccessAt: string;
}

interface RoomSidebarProps {
  currentUser: { name: string } | null;
  roomHistory: Room[];
  currentRoomId: string | null;
  onRoomSelected: (roomId: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: (url: string) => void;
  onLogout: () => void;
  loading: boolean;
  error: string | null;
}

export default function RoomSidebar({
  currentUser,
  roomHistory,
  currentRoomId,
  onRoomSelected,
  onCreateRoom,
  onJoinRoom,
  onLogout,
  loading,
  error,
}: RoomSidebarProps) {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinRoomUrl, setJoinRoomUrl] = useState("");

  const handleJoinRoom = useCallback(() => {
    if (joinRoomUrl.trim()) {
      onJoinRoom(joinRoomUrl);
      setJoinRoomUrl("");
      setShowJoinForm(false);
    }
  }, [joinRoomUrl, onJoinRoom]);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WebChat
          </h1>
          {currentUser && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-6 h-6 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-24">{currentUser.name}</span>
            </div>
          )}
        </div>

        {/* ルーム作成・参加ボタン */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={onCreateRoom}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
            ) : (
              <svg
                className="w-3 h-3"
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
            作成
          </button>
          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            参加
          </button>
        </div>

        {/* 参加フォーム */}
        {showJoinForm && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="text"
              value={joinRoomUrl}
              onChange={(e) => setJoinRoomUrl(e.target.value)}
              placeholder="ルームURLを貼り付け"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleJoinRoom}
                disabled={loading || !joinRoomUrl.trim()}
                className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? "参加中..." : "参加"}
              </button>
              <button
                onClick={() => {
                  setShowJoinForm(false);
                  setJoinRoomUrl("");
                }}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-md transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* ルーム履歴 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 px-2">
            参加中のルーム
          </h3>
          {roomHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              まだルームに参加していません
            </div>
          ) : (
            <div className="space-y-1">
              {roomHistory.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onRoomSelected(room.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                    currentRoomId === room.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-l-4 border-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="font-medium truncate">
                    ルーム {room.id.slice(0, 8)}...
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(room.lastAccessAt).toLocaleDateString("ja-JP")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ログアウトボタン */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          ログアウト
        </button>
      </div>
    </div>
  );
}
