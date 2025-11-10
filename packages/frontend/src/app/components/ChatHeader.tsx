import type { User } from "../types";

interface ChatHeaderProps {
  currentRoomId: string | null;
  onCopyRoomUrl: () => void;
  authenticated: boolean;
  roomJoined: boolean;
}

export function ChatHeader({
  currentRoomId,
  onCopyRoomUrl,
  authenticated,
  roomJoined,
}: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            チャットルーム
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {currentRoomId}
          </p>
        </div>
        <button
          onClick={onCopyRoomUrl}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md transition-colors flex items-center gap-1"
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          URLコピー
        </button>
      </div>

      {!authenticated && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
            <span className="text-yellow-800 dark:text-yellow-200 text-sm">
              認証中...
            </span>
          </div>
        </div>
      )}
      {authenticated && !roomJoined && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-blue-800 dark:text-blue-200 text-sm">
              ルームに参加中...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
