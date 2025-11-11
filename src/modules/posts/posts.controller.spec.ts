import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ManagePostDto } from './dto/manage-post.dto';
import { UpdatePostTagsDto } from './dto/update-post-tags.dto';
import { UserPayload } from 'src/common/types/user-payload';

describe('PostsController', () => {
  let controller: PostsController;
  let mockPostsService: DeepMockProxy<PostsService>;

  beforeEach(async () => {
    mockPostsService = mockDeep<PostsService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  describe('create', () => {
    it('should create a new post and return its ID', async () => {
      const boardId = 'board-id-1';
      const statusId = 'status-id-1';
      const tagIds = ['tag-id-1', 'tag-id-2'];
      const expectedId = 'post-id-1';
      const dto: CreatePostDto = {
        boardId,
        statusId,
        tagIds,
        description: 'description example',
        title: 'title example',
        isLocked: false,
        isPinned: false,
        isPrivate: false,
      };
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'email@example.com',
        name: 'John Doe',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostsService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto, user);

      expect(mockPostsService.create).toHaveBeenCalledWith(dto, user);
      expect(mockPostsService.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });

    it('should create a post with minimal required fields', async () => {
      const expectedId = 'post-id-2';
      const dto: CreatePostDto = {
        boardId: 'board-id-1',
        description: 'minimal description',
        title: 'minimal title',
      };
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'email@example.com',
        name: 'John Doe',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostsService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto, user);

      expect(mockPostsService.create).toHaveBeenCalledWith(dto, user);
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should return a post wrapped in an object with a data key', async () => {
      const postId = 'post-id-1';
      const post = {
        id: postId,
        description: 'description example',
        title: 'title example',
        isLocked: false,
        isPinned: false,
        isPrivate: false,
        boardId: 'board-id-1',
        status: { id: 'status-id-1', name: 'To Do' },
        statusId: 'status-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPostsService.findOne.mockResolvedValue(post as any);

      const result = await controller.findOne(postId);

      expect(mockPostsService.findOne).toHaveBeenCalledWith(postId);
      expect(mockPostsService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: post });
    });
  });

  describe('findComments', () => {
    it('should return all comments from a post wrapped in data property', async () => {
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockComments = [
        {
          id: 'comment-id-1',
          content: 'First comment',
          postId,
          organizationId,
          author: {
            id: 'user-id-1',
            name: 'John Doe',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'comment-id-2',
          content: 'Second comment',
          postId,
          organizationId,
          author: {
            id: 'user-id-1',
            name: 'John Doe',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockPostsService.findCommentsFromPost.mockResolvedValue(mockComments);

      const result = await controller.findComments(postId);

      expect(mockPostsService.findCommentsFromPost).toHaveBeenCalledWith(postId);
      expect(mockPostsService.findCommentsFromPost).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockComments });
    });
  });

  describe('update', () => {
    it('should update a post and return it wrapped in data property', async () => {
      const postId = 'post-id-1';
      const dto: UpdatePostDto = {
        title: 'Updated title',
        description: 'Updated description',
      };
      const updatedPost = {
        id: postId,
        title: 'Updated title',
        description: 'Updated description',
        isLocked: false,
        isPinned: false,
        isPrivate: false,
        boardId: 'board-id-1',
        status: { id: 'status-id-1', name: 'To Do' },
        statusId: 'status-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.update(postId, dto);

      expect(mockPostsService.update).toHaveBeenCalledWith(postId, dto);
      expect(mockPostsService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: { post: updatedPost } });
    });

    it('should allow partial updates', async () => {
      const postId = 'post-id-2';
      const dto: UpdatePostDto = {
        title: 'Only title updated',
      };
      const updatedPost = {
        id: postId,
        title: 'Only title updated',
        description: 'Original description',
        isLocked: false,
        isPinned: false,
        isPrivate: false,
        boardId: 'board-id-1',
        status: { id: 'status-id-1', name: 'To Do' },
        statusId: 'status-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.update(postId, dto);

      expect(mockPostsService.update).toHaveBeenCalledWith(postId, dto);
      expect(result).toEqual({ data: { post: updatedPost } });
    });
  });

  describe('managePost', () => {
    it('should manage post settings and return updated post', async () => {
      const postId = 'post-id-1';
      const dto: ManagePostDto = {
        isLocked: true,
        isPinned: true,
        isPrivate: true,
      };
      const updatedPost = {
        id: postId,
        title: 'title example',
        description: 'description example',
        isLocked: true,
        isPinned: true,
        isPrivate: true,
        boardId: 'board-id-1',
        status: { id: 'status-id-1', name: 'To Do' },
        statusId: 'status-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.managePost(postId, dto);

      expect(mockPostsService.update).toHaveBeenCalledWith(postId, dto);
      expect(mockPostsService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: { post: updatedPost } });
    });

    it('should allow updating status and tags', async () => {
      const postId = 'post-id-2';
      const dto: ManagePostDto = {
        statusId: 'new-status-id',
        tagIds: ['tag-id-1', 'tag-id-2'],
      };
      const updatedPost = {
        id: postId,
        title: 'title example',
        description: 'description example',
        isLocked: false,
        isPinned: false,
        isPrivate: false,
        boardId: 'board-id-1',
        status: { id: 'new-status-id', name: 'New Status' },
        statusId: 'new-status-id',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.managePost(postId, dto);

      expect(mockPostsService.update).toHaveBeenCalledWith(postId, dto);
      expect(result).toEqual({ data: { post: updatedPost } });
    });
  });

  describe('updateTags', () => {
    it('should update post tags', async () => {
      const postId = 'post-id-1';
      const dto: UpdatePostTagsDto = {
        tagIds: ['tag-id-1', 'tag-id-2', 'tag-id-3'],
      };

      mockPostsService.updateTags.mockResolvedValue(undefined);

      const result = await controller.updateTags(postId, dto);

      expect(mockPostsService.updateTags).toHaveBeenCalledWith(postId, dto);
      expect(mockPostsService.updateTags).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle empty tag array', async () => {
      const postId = 'post-id-2';
      const dto: UpdatePostTagsDto = {
        tagIds: [],
      };

      mockPostsService.updateTags.mockResolvedValue(undefined);

      const result = await controller.updateTags(postId, dto);

      expect(mockPostsService.updateTags).toHaveBeenCalledWith(postId, dto);
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      const postId = 'post-id-1';

      mockPostsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(postId);

      expect(mockPostsService.remove).toHaveBeenCalledWith(postId);
      expect(mockPostsService.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('vote', () => {
    it('should add or remove vote from post', async () => {
      const postId = 'post-id-1';
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'email@example.com',
        name: 'John Doe',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const voteResponse = { voted: true, message: 'Voto adicionado com sucesso', id: 'vote-id-1' };

      mockPostsService.vote.mockResolvedValue(voteResponse);

      const result = await controller.vote(postId, user);

      expect(mockPostsService.vote).toHaveBeenCalledWith(postId, user.id);
      expect(mockPostsService.vote).toHaveBeenCalledTimes(1);
      expect(result).toEqual(voteResponse);
    });
  });
});
