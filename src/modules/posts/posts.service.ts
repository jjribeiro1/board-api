import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async create(dto: CreatePostDto, userId: string) {
    return this.postsRepository.create(dto, userId);
  }

  async findOne(postId: string) {
    const post = await this.postsRepository.findOne(postId);
    if (!post) {
      throw new NotFoundException(`post com id: ${postId} não encontrado`);
    }

    return post;
  }

  async findCommentsFromPost(postId: string) {
    await this.findOne(postId);
    return this.postsRepository.findCommentsFromPost(postId);
  }

  async update(postId: string, dto: UpdatePostDto) {
    await this.findOne(postId);
    return this.postsRepository.update(postId, dto);
  }

  async remove(postId: string, user: User) {
    await this.verifyIfUserCanRemovePost(postId, user);
    await this.postsRepository.delete(postId);
  }

  async verifyIfUserCanRemovePost(postId: string, user: User) {
    const post = await this.findOne(postId);
    if (post.author.id !== user.id) {
      throw new ForbiddenException('Usuário sem permissão para realizar esta ação');
    }
    if (!user.organizations.some((org) => org.organizationId === post.organizationId && org.role === 'OWNER')) {
      throw new ForbiddenException('Usuário sem permissão para realizar esta ação');
    }
  }
}
