import Database from "better-sqlite3";
import path from "path";

// データベースファイルのパス
const dbPath = path.join(process.cwd(), "chat.db");
const db = new Database(dbPath);

// テーブルの作成
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    picture TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
`);

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at: string;
  last_login_at: string;
}

// ユーザーをGoogle IDで検索
export function findUserByGoogleId(googleId: string): User | undefined {
  const stmt = db.prepare("SELECT * FROM users WHERE google_id = ?");
  return stmt.get(googleId) as User | undefined;
}

// ユーザーをIDで検索
export function findUserById(id: string): User | undefined {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as User | undefined;
}

// ユーザーを作成または更新
export function upsertUser(
  id: string,
  googleId: string,
  email: string,
  name: string | null,
  picture: string | null,
): User {
  const stmt = db.prepare(`
    INSERT INTO users (id, google_id, email, name, picture, last_login_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(google_id) DO UPDATE SET
      email = excluded.email,
      name = excluded.name,
      picture = excluded.picture,
      last_login_at = datetime('now')
    RETURNING *
  `);
  return stmt.get(id, googleId, email, name, picture) as User;
}

export default db;
