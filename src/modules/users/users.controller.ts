import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/is-public.decorator';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { RequestAvatarUploadUrlDto } from './dto/request-avatar-upload-url.dto';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';
import { UserPayload } from 'src/common/types/user-payload';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   *
   * Create new user and returns the ID
   */
  @Public()
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   *
   * Returns an user by ID
   */
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneWithResolvedAvatar(id);
    return {
      data: { ...user, password: undefined },
    };
  }

  /**
   * Returns organizations from an user
   */
  @ApiBearerAuth()
  @Get(':id/organizations')
  async findOrgFromUser(@Param('id') id: string) {
    const organizations = await this.usersService.organizationsFromUser(id);
    return {
      data: organizations,
    };
  }

  /**
   * Gera uma URL pré-assinada para o upload da foto de perfil.
   * O cliente deve fazer um PUT diretamente para essa URL com o arquivo.
   */
  @ApiBearerAuth()
  @Patch('me/avatar/upload-url')
  async requestAvatarUploadUrl(@LoggedUser() user: UserPayload, @Body() dto: RequestAvatarUploadUrlDto) {
    return this.usersService.requestAvatarUploadUrl(user.id, dto);
  }

  /**
   * Confirma o upload do avatar salvando a URL pública no perfil do usuário.
   * Chame este endpoint após o upload bem-sucedido via pre-signed URL.
   */
  @ApiBearerAuth()
  @Patch('me/avatar/confirm')
  async confirmAvatarUpload(@LoggedUser() user: UserPayload, @Body() dto: ConfirmAvatarUploadDto) {
    return this.usersService.confirmAvatarUpload(user.id, dto);
  }
}
