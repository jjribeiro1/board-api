import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class CryptoService {
  async hasher(data: string | Buffer, salt: number) {
    return hash(data, salt);
  }

  async compareHash(plainText: string | Buffer, encrypted: string) {
    return compare(plainText, encrypted);
  }
}
