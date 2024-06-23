import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { CryptoService } from 'src/app/crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(dto: CreateUserDto) {
    const { email, name, password } = dto;
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
}
