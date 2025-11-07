import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client シングルトンインスタンス
 */
const prisma = new PrismaClient();

/**
 * ユーザー情報
 */
export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}

/**
 * Google ID からユーザーを検索
 */
export async function findUserByGoogleId(
  googleId: string
): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { googleId },
  });
}

/**
 * ユーザー ID からユーザーを検索
 */
export async function findUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}

/**
 * ユーザーを作成または更新
 * 同じ Google ID でログインするユーザーは統合される
 */
export async function upsertUser(
  id: string,
  googleId: string,
  email: string,
  name: string | null,
  picture: string | null
): Promise<User> {
  return await prisma.user.upsert({
    where: { googleId },
    update: {
      email,
      name,
      picture,
      lastLoginAt: new Date(),
    },
    create: {
      id,
      googleId,

      email,
      name,
      picture,
    },
  });
}

/**
 * ルームを作成
 */
export async function createRoom(roomId: string) {
  return await prisma.room.create({
    data: { id: roomId },
  });
}

/**
 * ルームを取得
 */
export async function findRoomById(roomId: string) {
  return await prisma.room.findUnique({
    where: { id: roomId },
  });
}

/**
 * ユーザーをルームに参加させる
 */
export async function joinRoom(participantId: string, roomId: string, userId: string) {
  return await prisma.roomParticipant.upsert({
    where: {
      roomId_userId: { roomId, userId },
    },
    update: {
      lastAccessAt: new Date(),
    },
    create: {
      id: participantId,
      roomId,
      userId,
    },
  });
}

/**
 * ユーザーのルーム参加履歴を取得
 */
export async function getUserRoomHistory(userId: string) {
  return await prisma.roomParticipant.findMany({
    where: { userId },
    include: {
      room: true,
    },
    orderBy: {
      lastAccessAt: "desc",
    },
  });
}

/**
 * ルームのメッセージ履歴を取得
 */
export async function getRoomMessages(roomId: string, limit = 100) {
  return await prisma.message.findMany({
    where: { roomId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });
}

/**
 * メッセージを保存
 */
export async function saveMessage(
  messageId: string,
  roomId: string,
  userId: string,
  text: string
) {
  return await prisma.message.create({
    data: {
      id: messageId,
      roomId,
      userId,
      text,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export default prisma;
