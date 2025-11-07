import jwt from "jsonwebtoken";

// JWT シークレットキー（本番環境では環境変数から取得すべき）
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
}

// JWTトークンを生成
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: "7d" } // 7日間有効
  );
}

// JWTトークンを検証
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
