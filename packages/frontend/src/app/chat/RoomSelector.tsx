"use client";

import { useState, useCallback } from "react";
import { useAtom } from "jotai";
import {
  currentRoomIdAtom,
  roomHistoryAtom,
  tokenAtom,
} from "./chatStore";

interface RoomSelectorProps {
  onRoomSelected: (roomId: string) => void;
}

export default function RoomSelector({ onRoomSelected }: RoomSelectorProps) {
  const [token] = useAtom(tokenAtom);
  const [roomHistory, setRoomHistory] = useAtom(roomHistoryAtom);
  const [, setCurrentRoomId] = useAtom(currentRoomIdAtom);
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 新しいルームを作成
   */
  const createRoom = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/rooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const roomId = data.room.id;

      setCurrentRoomId(roomId);
      onRoomSelected(roomId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to create room:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, setCurrentRoomId, onRoomSelected]);

  /**
   * ルームに参加
   */
  const joinRoom = useCallback(
    async (roomId: string) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:3001/api/rooms/${roomId}/join`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // ルーム履歴を更新
        const updatedHistory = [
          {
            id: roomId,
            joinedAt: data.participant.joinedAt,
            lastAccessAt: data.participant.lastAccessAt,
            createdAt: data.room.createdAt,
          },
          ...roomHistory.filter((r) => r.id !== roomId),
        ];
        setRoomHistory(updatedHistory);

        setCurrentRoomId(roomId);
        onRoomSelected(roomId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to join room:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [token, roomHistory, setRoomHistory, setCurrentRoomId, onRoomSelected]
  );

  const handleJoinByInput = () => {
    if (roomInput.trim()) {
      joinRoom(roomInput.trim());
      setRoomInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoinByInput();
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
          ルームを選択
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* 新しいルームを作成 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            新しいルームを作成
          </h2>
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "作成中..." : "新しいルームを作成"}
          </button>
        </div>

        {/* ルームIDで参加 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            ルームIDで参加
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="ルームID (UUID) を入力..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
            <button
              onClick={handleJoinByInput}
              disabled={loading || !roomInput.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              参加
            </button>
          </div>
        </div>

        {/* 参加履歴 */}
        {roomHistory.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              参加履歴
            </h2>
            <div className="space-y-3">
              {roomHistory.map((room) => (
                <button
                  key={room.id}
                  onClick={() => joinRoom(room.id)}
                  disabled={loading}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-300 truncate">
                        {room.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        最終アクセス:{" "}
                        {new Date(room.lastAccessAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0"
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
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
