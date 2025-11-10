import type { Room } from "../types";

interface RoomListProps {
  roomHistory: Room[];
  currentRoomId: string | null;
  onRoomSelected: (roomId: string) => void;
}

export function RoomList({
  roomHistory,
  currentRoomId,
  onRoomSelected,
}: RoomListProps) {
  return (
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
  );
}
