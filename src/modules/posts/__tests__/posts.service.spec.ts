import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts.service';
import { PostsRepository } from '../posts.repository';
import { mockCreatePostDto, mockPostEntity, mockPostsRepository } from 'test/mocks/posts';

describe('PostsService', () => {
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PostsRepository, useValue: mockPostsRepository }],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should call PostsRepository with correct values', async () => {
      await postsService.create(mockCreatePostDto, 'any-id');
      expect(mockPostsRepository.create).toHaveBeenCalledWith({ ...mockCreatePostDto }, 'any-id');
    });

    it('should throw if PostsRepository throws', async () => {
      mockPostsRepository.create.mockRejectedValueOnce(new Error('error'));
      await expect(postsService.create(mockCreatePostDto, 'any-id')).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the Posts created', async () => {
      mockPostsRepository.create.mockResolvedValueOnce(mockPostEntity.id);

      const result = await postsService.create(mockCreatePostDto, 'any-id');
      expect(result).toBe(mockPostEntity.id);
    });
  });
});
