import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';

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

  async findPostsFromOrganization(organizationId: string) {
    return this.postsRepository.findPostsFromOrganization(organizationId);
  }
}
