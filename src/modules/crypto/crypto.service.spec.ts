import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import * as bcrypt from 'bcrypt';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    cryptoService = module.get<CryptoService>(CryptoService);
  });

  describe('hasher', () => {
    it('should call bcrypt hash with correct values', async () => {
      const input = { data: 'any-value', salt: 10 };
      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

      await cryptoService.hasher(input.data, input.salt);

      expect(bcryptHashSpy).toHaveBeenCalledTimes(1);
      expect(bcryptHashSpy).toHaveBeenCalledWith(input.data, input.salt);
    });

    it('should return hashed value', async () => {
      const input = { data: 'any-value', salt: 10 };

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.resolve('any-hash'));

      const result = await cryptoService.hasher(input.data, input.salt);
      expect(result).toBe('any-hash');
    });

    it('should throw if bcrypt hash throws', async () => {
      const input = { data: 'any-value', salt: 10 };
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
        throw new Error('error');
      });

      await expect(
        cryptoService.hasher(input.data, input.salt),
      ).rejects.toThrow(new Error('error'));
    });
  });

  describe('compare', () => {
    it('should call bcrypt compare with correct values', async () => {
      const input = { plain: 'any-value', encrypted: 'any-encrypted-value' };

      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');

      await cryptoService.compareHash(input.plain, input.encrypted);

      expect(bcryptCompareSpy).toHaveBeenCalledTimes(1);
      expect(bcryptCompareSpy).toHaveBeenCalledWith(
        input.plain,
        input.encrypted,
      );
    });

    it('should return false if values does not match', async () => {
      const input = { plain: 'invalid-value', encrypted: 'encrypted-value' };

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(false));

      const result = await cryptoService.compareHash(
        input.plain,
        input.encrypted,
      );

      expect(result).toBe(false);
    });

    it('should return true if values match', async () => {
      const input = { plain: 'any-value', encrypted: 'any-encrypted-value' };

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(true));

      const result = await cryptoService.compareHash(
        input.plain,
        input.encrypted,
      );

      expect(result).toBe(true);
    });

    it('should throw if bcrypt compare throws', async () => {
      const input = { plain: 'any-value', encrypted: 'any-encrypted-value' };
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => {
        throw new Error('error');
      });

      await expect(
        cryptoService.compareHash(input.plain, input.encrypted),
      ).rejects.toThrow(new Error('error'));
    });
  });
});
