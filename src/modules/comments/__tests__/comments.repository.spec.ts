import { Test, TestingModule } from '@nestjs/testing';
import { CommentsRepository } from '../comments.repository';
import { createMockContext, MockContext } from 'src/shared/modules/database/prisma/prisma-client-mock';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { mockCommentEntity, mockCreateCommentDto } from 'test/mocks/comments';

describe('CommentsRepository', () => {
  let repository: CommentsRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentsRepository, { provide: PrismaService, useValue: mockCtx.prisma }],
    }).compile();

    repository = module.get<CommentsRepository>(CommentsRepository);
  });

  describe('create', () => {
    it('should create a new comment and return the ID', async () => {
      mockCtx.prisma.comment.create.mockResolvedValueOnce(mockCommentEntity);
      const result = await repository.create(mockCreateCommentDto, 'any-id');
      expect(result).toBe('any-id');
    });
  });
});
