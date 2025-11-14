import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { BoardsService } from '../boards/boards.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { VotesService } from '../votes/votes.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostTagsDto } from './dto/update-post-tags.dto';
import { UserPayload } from 'src/common/types/user-payload';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepositoryMock: DeepMockProxy<PostsRepository>;
  let boardsServiceMock: DeepMockProxy<BoardsService>;
  let organizationsServiceMock: DeepMockProxy<OrganizationsService>;
  let votesServiceMock: DeepMockProxy<VotesService>;

  beforeEach(async () => {
    postsRepositoryMock = mockDeep<PostsRepository>();
    boardsServiceMock = mockDeep<BoardsService>();
    organizationsServiceMock = mockDeep<OrganizationsService>();
    votesServiceMock = mockDeep<VotesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: postsRepositoryMock,
        },
        {
          provide: BoardsService,
          useValue: boardsServiceMock,
        },
        {
          provide: OrganizationsService,
          useValue: organizationsServiceMock,
        },
        {
          provide: VotesService,
          useValue: votesServiceMock,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    const dto: CreatePostDto = {
      boardId: 'board-id-1',
      title: 'New Feature Request',
      description: 'Please add this feature',
      statusId: 'status-id-1',
      tagIds: ['tag-id-1'],
      isPrivate: false,
      isPinned: false,
      isLocked: false,
    };
    const user: UserPayload = {
      id: 'user-id-1',
      email: 'user@example.com',
      name: 'John Doe',
      organizations: [
        {
          id: 'org-id-1',
          name: 'Test Org',
          role: 'ADMIN',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a post when user is ADMIN or OWNER and board is not locked', async () => {
      const board = {
        id: 'board-id-1',
        name: 'Feature Requests',
        organizationId: 'org-id-1',
        isLocked: false,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const expectedId = 'post-id-1';

      boardsServiceMock.findOne.mockResolvedValue(board as any);
      postsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto, user);

      expect(boardsServiceMock.findOne).toHaveBeenCalledWith(dto.boardId);
      expect(postsRepositoryMock.create).toHaveBeenCalledWith(dto, user.id);
      expect(result).toBe(expectedId);
    });

    it('should create a post with default status when user is MEMBER', async () => {
      const userMember: UserPayload = {
        ...user,
        organizations: [
          {
            id: 'org-id-1',
            name: 'Test Org',
            role: 'MEMBER',
          },
        ],
      };
      const board = {
        id: 'board-id-1',
        name: 'Feature Requests',
        organizationId: 'org-id-1',
        isLocked: false,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const organization = {
        id: 'org-id-1',
        name: 'Test Org',
        defaultStatusId: 'default-status-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const expectedId = 'post-id-3';

      boardsServiceMock.findOne.mockResolvedValue(board as any);
      organizationsServiceMock.findOne.mockResolvedValue(organization as any);
      postsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto, userMember);

      expect(organizationsServiceMock.findOne).toHaveBeenCalledWith(board.organizationId);
      expect(postsRepositoryMock.create).toHaveBeenCalledWith(
        {
          boardId: dto.boardId,
          title: dto.title,
          description: dto.description,
          statusId: organization.defaultStatusId,
        },
        userMember.id,
      );
      expect(result).toBe(expectedId);
    });

    it('should throw BadRequestException when board is locked', async () => {
      const board = {
        id: 'board-id-1',
        name: 'Feature Requests',
        organizationId: 'org-id-1',
        isLocked: true,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      boardsServiceMock.findOne.mockResolvedValue(board as any);

      const errorMessage = 'novas postagens não são permitidas em um board bloqueado';

      await expect(service.create(dto, user)).rejects.toThrow(new BadRequestException(errorMessage));

      expect(postsRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should create post with minimal fields when user is not ADMIN/OWNER', async () => {
      const userMember: UserPayload = {
        id: 'user-id-2',
        email: 'member@example.com',
        name: 'Jane Doe',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const board = {
        id: 'board-id-1',
        name: 'Feature Requests',
        organizationId: 'org-id-1',
        isLocked: false,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const organization = {
        id: 'org-id-1',
        name: 'Test Org',
        defaultStatusId: 'default-status-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const expectedId = 'post-id-4';

      boardsServiceMock.findOne.mockResolvedValue(board as any);
      organizationsServiceMock.findOne.mockResolvedValue(organization as any);
      postsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto, userMember);

      expect(postsRepositoryMock.create).toHaveBeenCalledWith(
        {
          boardId: dto.boardId,
          title: dto.title,
          description: dto.description,
          statusId: organization.defaultStatusId,
        },
        userMember.id,
      );
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should return a post when found', async () => {
      const postId = 'post-id-1';
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      postsRepositoryMock.findOne.mockResolvedValue(post as any);

      const result = await service.findOne(postId);

      expect(postsRepositoryMock.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(post);
    });

    it('should throw NotFoundException when post is not found', async () => {
      const postId = 'non-existent-id';

      postsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `post com id: ${postId} não encontrado`;

      await expect(service.findOne(postId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(postsRepositoryMock.findOne).toHaveBeenCalledWith(postId);
    });
  });

  describe('findCommentsFromPost', () => {
    it('should return comments from a post', async () => {
      const postId = 'post-id-1';
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const comments = [
        {
          id: 'comment-id-1',
          content: 'Great idea!',
          author: { id: 'user-id-2', name: 'Jane Doe' },
          postId,
          organizationId: 'org-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      postsRepositoryMock.findCommentsFromPost.mockResolvedValue(comments as any);

      const result = await service.findCommentsFromPost(postId);

      expect(postsRepositoryMock.findOne).toHaveBeenCalledWith(postId);
      expect(postsRepositoryMock.findCommentsFromPost).toHaveBeenCalledWith(postId);
      expect(result).toEqual(comments);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      const postId = 'non-existent-id';

      postsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `post com id: ${postId} não encontrado`;

      await expect(service.findCommentsFromPost(postId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(postsRepositoryMock.findCommentsFromPost).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const postId = 'post-id-1';
      const dto: UpdatePostDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const post = {
        id: postId,
        title: 'Original Title',
        description: 'Original Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedPost = {
        ...post,
        title: dto.title,
        description: dto.description,
      };

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      postsRepositoryMock.update.mockResolvedValue(updatedPost as any);

      const result = await service.update(postId, dto);

      expect(postsRepositoryMock.findOne).toHaveBeenCalledWith(postId);
      expect(postsRepositoryMock.update).toHaveBeenCalledWith(postId, dto);
      expect(result).toEqual(updatedPost);
    });

    it('should allow partial updates', async () => {
      const postId = 'post-id-2';
      const dto: UpdatePostDto = {
        title: 'Only Title Updated',
      };
      const post = {
        id: postId,
        title: 'Original Title',
        description: 'Original Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedPost = {
        ...post,
        title: dto.title,
      };

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      postsRepositoryMock.update.mockResolvedValue(updatedPost as any);

      const result = await service.update(postId, dto);

      expect(postsRepositoryMock.update).toHaveBeenCalledWith(postId, dto);
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      const postId = 'non-existent-id';
      const dto: UpdatePostDto = {
        title: 'Updated Title',
      };

      postsRepositoryMock.findOne.mockResolvedValue(null);
      const errorMessage = `post com id: ${postId} não encontrado`;

      await expect(service.update(postId, dto)).rejects.toThrow(new NotFoundException(errorMessage));
      expect(postsRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      const postId = 'post-id-1';
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      postsRepositoryMock.delete.mockResolvedValue(undefined);

      await service.remove(postId);

      expect(postsRepositoryMock.findOne).toHaveBeenCalledWith(postId);
      expect(postsRepositoryMock.delete).toHaveBeenCalledWith(postId);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      const postId = 'non-existent-id';

      postsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.remove(postId)).rejects.toThrow(NotFoundException);

      expect(postsRepositoryMock.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateTags', () => {
    it('should update post tags successfully', async () => {
      const postId = 'post-id-1';
      const dto: UpdatePostTagsDto = {
        tagIds: ['tag-id-1', 'tag-id-2'],
      };
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const authorAndOrgId = {
        authorId: 'user-id-1',
        organizationId: 'org-id-1',
      };
      const tags = [
        { id: 'tag-id-1', name: 'Bug', color: '#FF0000', organizationId: 'org-id-1' },
        { id: 'tag-id-2', name: 'Feature', color: '#00FF00', organizationId: 'org-id-1' },
      ];

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      postsRepositoryMock.findAuthorAndOrgIdFromPost.mockResolvedValue(authorAndOrgId);
      organizationsServiceMock.findTagsFromOrganization.mockResolvedValue(tags as any);
      postsRepositoryMock.updateTags.mockResolvedValue(undefined);

      await service.updateTags(postId, dto);

      expect(postsRepositoryMock.findOne).toHaveBeenCalledWith(postId);
      expect(postsRepositoryMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(organizationsServiceMock.findTagsFromOrganization).toHaveBeenCalledWith(authorAndOrgId.organizationId);
      expect(postsRepositoryMock.updateTags).toHaveBeenCalledWith(postId, dto.tagIds);
    });

    it('should throw BadRequestException when author and org info not found', async () => {
      const postId = 'post-id-1';
      const dto: UpdatePostTagsDto = {
        tagIds: ['tag-id-1'],
      };
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      postsRepositoryMock.findAuthorAndOrgIdFromPost.mockResolvedValue(null);

      await expect(service.updateTags(postId, dto)).rejects.toThrow(BadRequestException);

      expect(organizationsServiceMock.findTagsFromOrganization).not.toHaveBeenCalled();
      expect(postsRepositoryMock.updateTags).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when tags do not belong to organization', async () => {
      const postId = 'post-id-1';
      const dto: UpdatePostTagsDto = {
        tagIds: ['tag-id-1', 'tag-id-invalid'],
      };
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const authorAndOrgId = {
        authorId: 'user-id-1',
        organizationId: 'org-id-1',
      };
      const tags = [{ id: 'tag-id-1', name: 'Bug', color: '#FF0000', organizationId: 'org-id-1' }];

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      postsRepositoryMock.findAuthorAndOrgIdFromPost.mockResolvedValue(authorAndOrgId);
      organizationsServiceMock.findTagsFromOrganization.mockResolvedValue(tags as any);

      const errorMessage = 'uma ou mais tags não pertencem à organização do post';

      await expect(service.updateTags(postId, dto)).rejects.toThrow(new ConflictException(errorMessage));

      expect(postsRepositoryMock.updateTags).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when post does not exist', async () => {
      const postId = 'non-existent-id';
      const dto: UpdatePostTagsDto = {
        tagIds: ['tag-id-1'],
      };

      postsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `post com id: ${postId} não encontrado`;

      await expect(service.updateTags(postId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(postsRepositoryMock.findAuthorAndOrgIdFromPost).not.toHaveBeenCalled();
      expect(postsRepositoryMock.updateTags).not.toHaveBeenCalled();
    });
  });

  describe('vote', () => {
    it('should toggle vote on post when post is not locked', async () => {
      const postId = 'post-id-1';
      const userId = 'user-id-1';
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-2', name: 'Jane Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const voteResponse = { voted: true };

      postsRepositoryMock.findOne.mockResolvedValue(post as any);
      votesServiceMock.togglePostVote.mockResolvedValue(voteResponse as any);

      const result = await service.vote(postId, userId);

      expect(postsRepositoryMock.findOne).toHaveBeenCalledWith(postId);
      expect(votesServiceMock.togglePostVote).toHaveBeenCalledWith(postId, userId);
      expect(result).toEqual(voteResponse);
    });

    it('should throw BadRequestException when post is locked', async () => {
      const postId = 'post-id-1';
      const userId = 'user-id-1';
      const post = {
        id: postId,
        title: 'Test Post',
        description: 'Test Description',
        isPrivate: false,
        isPinned: false,
        isLocked: true,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-2', name: 'Jane Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      postsRepositoryMock.findOne.mockResolvedValue(post as any);

      const errorMessage = 'Não é possível votar em um post bloqueado';

      await expect(service.vote(postId, userId)).rejects.toThrow(new BadRequestException(errorMessage));

      expect(votesServiceMock.togglePostVote).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when post does not exist', async () => {
      const postId = 'non-existent-id';
      const userId = 'user-id-1';

      postsRepositoryMock.findOne.mockResolvedValue(null);
      const errorMessage = `post com id: ${postId} não encontrado`;

      await expect(service.vote(postId, userId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(votesServiceMock.togglePostVote).not.toHaveBeenCalled();
    });
  });

  describe('findAuthorAndOrgIdFromPost', () => {
    it('should return author and organization ID from post', async () => {
      const postId = 'post-id-1';
      const authorAndOrgId = {
        authorId: 'user-id-1',
        organizationId: 'org-id-1',
      };

      postsRepositoryMock.findAuthorAndOrgIdFromPost.mockResolvedValue(authorAndOrgId);

      const result = await service.findAuthorAndOrgIdFromPost(postId);

      expect(postsRepositoryMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(result).toEqual(authorAndOrgId);
    });

    it('should return null when post does not exist', async () => {
      const postId = 'non-existent-id';

      postsRepositoryMock.findAuthorAndOrgIdFromPost.mockResolvedValue(null);

      const result = await service.findAuthorAndOrgIdFromPost(postId);

      expect(result).toBeNull();
    });
  });
});
