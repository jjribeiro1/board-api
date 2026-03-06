import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostTagsDto } from './dto/update-post-tags.dto';
import { ManagePostDto } from './dto/manage-post.dto';
import { BoardsService } from '../boards/boards.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { VotesService } from '../votes/votes.service';
import { UserPayload } from 'src/common/types/user-payload';
import { ResourceOwnershipInfo, ResourceOwnershipResolver } from 'src/common/interfaces/resource-info.interface';
import { EVENTS } from 'src/constants/events';
import { PostStatusChangedEventDto } from '../events/dto/post-events.dto';

@Injectable()
export class PostsService implements ResourceOwnershipResolver {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly boardsService: BoardsService,
    private readonly organizationsService: OrganizationsService,
    private readonly votesService: VotesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreatePostDto, user: UserPayload) {
    const board = await this.boardsService.findOne(dto.boardId);
    if (board.isLocked) {
      throw new BadRequestException(`novas postagens não são permitidas em um board bloqueado`);
    }

    const userIsAdminOrOwnerOfOrg = user.organizations.some(
      (org) => org.id === board.organizationId && (org.role === 'ADMIN' || org.role === 'OWNER'),
    );

    if (userIsAdminOrOwnerOfOrg) {
      return await this.postsRepository.create(dto, user.id);
    }

    const organizationInfo = await this.organizationsService.findOne(board.organizationId);

    return await this.postsRepository.create(
      {
        boardId: dto.boardId,
        title: dto.title,
        description: dto.description,
        statusId: organizationInfo.defaultStatusId!,
      },
      user.id,
    );
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
    const comments = await this.postsRepository.findCommentsFromPost(postId);
    return comments.filter((comment) => comment.parentId === null);
  }

  async update(postId: string, dto: UpdatePostDto | ManagePostDto, user?: UserPayload) {
    const existingPost = await this.findOne(postId);
    const updatedPost = await this.postsRepository.update(postId, dto);

    const statusId = 'statusId' in dto ? dto.statusId : undefined;
    if (statusId && statusId !== existingPost.status?.id && user) {
      this.eventEmitter.emit(
        EVENTS.post.statusChanged,
        new PostStatusChangedEventDto(
          existingPost.id,
          existingPost.title,
          existingPost.author.id,
          existingPost.status?.name ?? null,
          updatedPost.status?.name ?? '',
          user.id,
          user.name,
          existingPost.organizationId,
        ),
      );
    }

    return updatedPost;
  }

  async remove(postId: string) {
    await this.findOne(postId);
    await this.postsRepository.delete(postId);
  }

  async updateTags(postId: string, dto: UpdatePostTagsDto) {
    await this.findOne(postId);
    const authorAndOrgIdFromPost = await this.findOrgAndAuthorId(postId);

    if (!authorAndOrgIdFromPost) {
      throw new BadRequestException();
    }

    const tagsFromOrg = await this.organizationsService.findTagsFromOrganization(authorAndOrgIdFromPost.organizationId);
    const allTagsAreValid = dto.tagIds.every((tagId) => tagsFromOrg.some((tag) => tag.id === tagId));

    if (!allTagsAreValid) {
      throw new ConflictException('uma ou mais tags não pertencem à organização do post');
    }

    return await this.postsRepository.updateTags(postId, dto.tagIds);
  }

  async vote(postId: string, userId: string) {
    const post = await this.findOne(postId);
    if (post.isLocked) {
      throw new BadRequestException('Não é possível votar em um post bloqueado');
    }
    return await this.votesService.togglePostVote(postId, userId);
  }

  async findOrgAndAuthorId(postId: string): Promise<ResourceOwnershipInfo | null> {
    return await this.postsRepository.findOrgAndAuthorId(postId);
  }
}
