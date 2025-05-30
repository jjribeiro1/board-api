import { compare, hash } from 'bcrypt';

export async function hashData(data: string | Buffer, salt: number) {
  return hash(data, salt);
}

export async function compareHash(plainText: string | Buffer, encrypted: string) {
  return compare(plainText, encrypted);
}
