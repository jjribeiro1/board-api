import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { hashData } from 'src/utils/hasher';
import { StorageService } from 'src/shared/modules/storage/storage.service';
import { RequestAvatarUploadUrlDto } from './dto/request-avatar-upload-url.dto';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateUserDto) {
    const { email, name, password } = dto;

    const emailAlreadyInUse = await this.usersRepository.findByEmail(email);
    if (emailAlreadyInUse) {
      throw new ConflictException(`Email ${email} já foi registrado`);
    }

    return this.usersRepository.create({
      email,
      name,
      password: await hashData(password, 10),
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`usuário com id: ${id} não encontrado`);
    }

    return user;
  }

  /**
   * Retorna o usuário com a avatarUrl resolvida para uma pre-signed GET URL.
   * Usado nos endpoints que expõem dados do usuário ao frontend.
   */
  async findOneWithResolvedAvatar(id: string) {
    const user = await this.findOne(id);
    const avatarUrl = await this.resolveAvatarUrl(user.avatarUrl);
    return { ...user, avatarUrl };
  }

  async organizationsFromUser(id: string) {
    await this.findOne(id);
    return this.usersRepository.organizationsFromUser(id);
  }

  async requestAvatarUploadUrl(userId: string, dto: RequestAvatarUploadUrlDto) {
    await this.findOne(userId);

    const { uploadUrl, key } = await this.storageService.generatePreSignedUrl(dto.filename, dto.contentType, 'avatars');
    return { uploadUrl, key };
  }

  async confirmAvatarUpload(userId: string, dto: ConfirmAvatarUploadDto) {
    const user = await this.findOne(userId);

    if (user.avatarUrl) {
      await this.storageService.deleteFile(user.avatarUrl).catch(() => {});
    }

    await this.usersRepository.updateAvatar(userId, dto.key);

    const avatarUrl = await this.resolveAvatarUrl(dto.key);
    return { avatarUrl };
  }

  async resolveAvatarUrl(avatarKey: string | null): Promise<string | null> {
    if (!avatarKey) return null;
    return this.storageService.generatePreSignedGetUrl(avatarKey);
  }
}
