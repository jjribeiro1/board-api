import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { TogglePostCommentsLockDto } from './dto/toggle-comments-lock.dto';

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

  async remove(postId: string) {
    await this.findOne(postId);
    await this.postsRepository.delete(postId);
  }

  async findAuthorAndOrgIdFromPost(postId: string) {
    return this.postsRepository.findAuthorAndOrgIdFromPost(postId);
  }

  async toggleCommentsLock(postId: string, dto: TogglePostCommentsLockDto) {
    await this.findOne(postId);
    return this.postsRepository.toggleCommentsLock(postId, dto.isLocked);
  }
}
