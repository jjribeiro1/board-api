import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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

  describe('findOne', () => {
    it('should return Post by id', async () => {
      mockPostsRepository.findOne.mockResolvedValueOnce(mockPostEntity);
      const result = await postsService.findOne('any-id');
      expect(result).toEqual(mockPostEntity);
    });

    it('should throw NotFoundException if Post not exists', async () => {
      mockPostsRepository.findOne.mockResolvedValueOnce(null);
      await expect(postsService.findOne('any-id')).rejects.toThrow(
        new NotFoundException(`post com id: any-id não encontrado`),
      );
    });

    it('should throw if OrganizationsRepository throws', async () => {
      mockPostsRepository.findOne.mockRejectedValueOnce(new Error('error'));
      await expect(postsService.findOne('any-id')).rejects.toThrow(new Error('error'));
    });
  });
});
