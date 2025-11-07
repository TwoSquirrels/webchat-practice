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

export default prisma;
