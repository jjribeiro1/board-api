import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/is-public.decorator';

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
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      data: user.toPresentation(),
    };
  }

  /**
   * Returns organizations from an user
   */
  @Get(':id/organizations')
  async findOrgFromUser(@Param('id') id: string) {
    const organizations = await this.usersService.organizationsFromUser(id);
    return {
      data: organizations,
    };
  }
}
