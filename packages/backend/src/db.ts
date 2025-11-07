import { PrismaClient } from "@prisma/client";

// Prisma Clientのシングルトンインスタンス
const prisma = new PrismaClient();

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}

// ユーザーをGoogle IDで検索
export async function findUserByGoogleId(
  googleId: string,
): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { googleId },
  });
}

// ユーザーをIDで検索
export async function findUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}

// ユーザーを作成または更新
export async function upsertUser(
  id: string,
  googleId: string,
  email: string,
  name: string | null,
  picture: string | null,
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
