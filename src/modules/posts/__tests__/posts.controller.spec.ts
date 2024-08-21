import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { mockPostsService, mockCreatePostDto, mockPostEntity } from 'test/mocks/posts';
import { mockUserEntity } from 'test/mocks/user';

jest.mock('src/shared/modules/auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementationOnce(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService, { provide: PostsService, useValue: mockPostsService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  describe('create', () => {
    it('should call PostsService with correct values', async () => {
      await controller.create(mockCreatePostDto, mockUserEntity);
      expect(mockPostsService.create).toHaveBeenCalledWith(mockCreatePostDto, mockUserEntity.id);
    });

    it('should throw if PostsService throws', async () => {
      mockPostsService.create.mockRejectedValueOnce(new Error('error'));
      await expect(controller.create(mockCreatePostDto, mockUserEntity)).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the Post created', async () => {
      mockPostsService.create.mockResolvedValueOnce(mockPostEntity.id);
      const result = await controller.create(mockCreatePostDto, mockUserEntity);

      expect(result).toBe(mockPostEntity.id);
    });
  });

  describe('findOne', () => {
    it('should return Post by id', async () => {
      mockPostsService.findOne.mockResolvedValueOnce(mockPostEntity);

      const result = await controller.findOne('any-id');
      expect(result).toEqual({ data: mockPostEntity });
    });

    it('should throw if OrganizationsService throws', async () => {
      mockPostsService.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findOne('any-id')).rejects.toThrow(new NotFoundException());
    });
  });
});
