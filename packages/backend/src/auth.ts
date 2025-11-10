import jwt from "jsonwebtoken";

/**
 * JWT シークレットキー
 * 本番環境では環境変数 JWT_SECRET を設定してください
 */
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable is required in production",
      );
    }
    console.warn(
      "Warning: Using default JWT secret for development. Set JWT_SECRET environment variable for production.",
    );
    return "dev-secret-key-do-not-use-in-production";
  })();

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * JWT トークンを生成
 * 有効期限は7日間
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email } as JWTPayload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * JWT トークンを検証
 * 無効なトークンや期限切れの場合は null を返す
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
