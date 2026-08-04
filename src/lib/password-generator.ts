import crypto from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** 推測されにくい仮パスワードを生成する（紛らわしい文字 0/O, 1/l/I は除外） */
export function generateTemporaryPassword(length = 10): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

/** ログインID用のランダムサフィックス（CSV一括登録時などの重複回避に使用） */
export function generateLoginIdSuffix(): string {
  return crypto.randomBytes(3).toString("hex");
}
