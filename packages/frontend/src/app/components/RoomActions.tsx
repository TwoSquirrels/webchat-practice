import { useState, useCallback } from "react";

interface RoomActionsProps {
  onCreateRoom: () => void;
  onJoinRoom: (url: string) => void;
  loading: boolean;
  error: string | null;
}

export function RoomActions({
  onCreateRoom,
  onJoinRoom,
  loading,
  error,
}: RoomActionsProps) {
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
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
