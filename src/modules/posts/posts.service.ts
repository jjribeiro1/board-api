import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostTagsDto } from './dto/update-post-tags.dto';
import { BoardsService } from '../boards/boards.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly boardsService: BoardsService,
  ) {}

  async create(dto: CreatePostDto, userId: string) {
    const board = await this.boardsService.findOne(dto.boardId);
    if (board.isLocked) {
      throw new BadRequestException(`novas postagens não são permitidas em um board bloqueado`);
    }
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

  async updateTags(postId: string, dto: UpdatePostTagsDto) {
    await this.findOne(postId);
    return this.postsRepository.updateTags(postId, dto.tagIds);
  }

  async findAuthorAndOrgIdFromPost(postId: string) {
    return await this.postsRepository.findAuthorAndOrgIdFromPost(postId);
  }
}
