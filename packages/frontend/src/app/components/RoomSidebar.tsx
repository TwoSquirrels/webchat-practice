"use client";

import { SidebarHeader } from "./SidebarHeader";
import { RoomActions } from "./RoomActions";
import { RoomList } from "./RoomList";
import type { Room, User } from "../types";

interface RoomSidebarProps {
  currentUser: User | null;
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
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <SidebarHeader currentUser={currentUser} onLogout={onLogout} />
      <RoomActions
        onCreateRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
        loading={loading}
        error={error}
      />
      <RoomList
        roomHistory={roomHistory}
        currentRoomId={currentRoomId}
        onRoomSelected={onRoomSelected}
      />
    </div>
  );
}
