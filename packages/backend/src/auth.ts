import jwt from "jsonwebtoken";

// JWT シークレットキー（環境変数から取得、開発環境ではデフォルト値を使用）
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  console.warn("Warning: Using default JWT secret for development. Set JWT_SECRET environment variable for production.");
  return "dev-secret-key-do-not-use-in-production";
})();

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
