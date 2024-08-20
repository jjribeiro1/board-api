import { Test, TestingModule } from '@nestjs/testing';
import { PostsRepository } from '../posts.repository';
import { createMockContext, MockContext } from 'src/shared/modules/database/prisma/prisma-client-mock';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { mockCreatePostDto, mockPostEntity } from 'test/mocks/posts';

describe('PostsRepository', () => {
  let repository: PostsRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsRepository, { provide: PrismaService, useValue: mockCtx.prisma }],
    }).compile();

    repository = module.get<PostsRepository>(PostsRepository);
  });

  describe('create', () => {
    it('should create a new organization and return the ID', async () => {
      mockCtx.prisma.post.create.mockResolvedValueOnce(mockPostEntity);
      const result = await repository.create(mockCreatePostDto);
      expect(result).toBe('any-id');
    });
  });
});
