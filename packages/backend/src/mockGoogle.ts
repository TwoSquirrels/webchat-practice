import { v4 as uuidv4 } from "uuid";

/**
 * モック Google ユーザー
 * テスト用ユーザーデータ
 */
interface MockGoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * テストユーザーリスト
 * ログイン画面で選択可能
 */
const mockUsers: MockGoogleUser[] = [
  {
    id: "google_mock_1",
    email: "user1@example.com",
    name: "テストユーザー1",
    picture: "https://via.placeholder.com/150?text=User1",
  },
  {
    id: "google_mock_2",
    email: "user2@example.com",
    name: "テストユーザー2",
    picture: "https://via.placeholder.com/150?text=User2",
  },
  {
    id: "google_mock_3",
    email: "user3@example.com",
    name: "テストユーザー3",
    picture: "https://via.placeholder.com/150?text=User3",
  },
];

/**
 * 認証コードの管理
 * メモリ上に保持し、15分で自動失効
 */
const authCodes = new Map<string, MockGoogleUser>();
const AUTH_CODE_EXPIRY_MS = 15 * 60 * 1000;

/**
 * 認証コードを生成
 * OAuth フロー用。15分間有効。
 */
export function generateAuthCode(userIndex: number = 0): string {
  const code = uuidv4();
  const user = mockUsers[userIndex % mockUsers.length];
  authCodes.set(code, user);

  // 有効期限後に自動削除
  setTimeout(() => {
    authCodes.delete(code);
  }, AUTH_CODE_EXPIRY_MS);

  return code;
}

/**
 * 認証コードからユーザー情報を取得 (コード消費)
 * コード取得後は Map から削除される
 */
export function getUserByAuthCode(code: string): MockGoogleUser | undefined {
  const user = authCodes.get(code);
  if (user) {
    authCodes.delete(code);
  }
  return user;
}

/**
 * テストユーザーリストを取得
 */
export function getMockUsers(): MockGoogleUser[] {
  return mockUsers;
}
