import { v4 as uuidv4 } from "uuid";

// モックユーザーデータ
// 実際のGoogle OAuthの代わりに使用
interface MockGoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// モックのGoogleユーザーのリスト
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

// 認証コードとユーザーのマッピング（一時的に保持）
const authCodes = new Map<string, MockGoogleUser>();

// 認証コードを生成してユーザーにマッピング
export function generateAuthCode(userIndex: number = 0): string {
  const code = uuidv4();
  const user = mockUsers[userIndex % mockUsers.length];
  authCodes.set(code, user);
  
  // 5分後に自動削除
  setTimeout(() => {
    authCodes.delete(code);
  }, 5 * 60 * 1000);
  
  return code;
}

// 認証コードからユーザー情報を取得
export function getUserByAuthCode(code: string): MockGoogleUser | undefined {
  const user = authCodes.get(code);
  if (user) {
    authCodes.delete(code); // 使用済みコードを削除
  }
  return user;
}

// モックユーザーのリストを取得（選択UI用）
export function getMockUsers(): MockGoogleUser[] {
  return mockUsers;
}
