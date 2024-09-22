import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { CryptoService } from 'src/shared/modules/crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
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
      password: await this.cryptoService.hasher(password, 10),
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`usuário com id: ${id} não encontrado`);
    }

    return user;
  }

  async organizationsFromUser(id: string) {
    await this.findOne(id);
    return this.usersRepository.organizationFromUser(id);
  }
}
