import { Test, TestingModule } from '@nestjs/testing';
import { VotesRepository } from './votes.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'src/generated/prisma/client';

describe('VotesRepository', () => {
  let repository: VotesRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotesRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<VotesRepository>(VotesRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPostVote', () => {
    it('should create a post vote and return the vote id', async () => {
      const postId = 'post-id-1';
      const userId = 'user-id-1';
      const expectedVoteId = 'vote-id-1';
      const mockVote = {
        id: expectedVoteId,
        postId,
        userId,
        createdAt: new Date(),
      };

      prismaServiceMock.postVote.create.mockResolvedValue(mockVote);

      const result = await repository.createPostVote(postId, userId);

      expect(prismaServiceMock.postVote.create).toHaveBeenCalledWith({
        data: {
          postId,
          userId,
        },
      });

      expect(result).toBe(expectedVoteId);
    });
  });

  describe('findVoteByUserAndPost', () => {
    it('should find and return a vote by user and post', async () => {
      const userId = 'user-id-1';
      const postId = 'post-id-1';
      const mockVote = {
        id: 'vote-id-1',
        postId,
        userId,
        createdAt: new Date(),
      };

      prismaServiceMock.postVote.findUnique.mockResolvedValue(mockVote);

      const result = await repository.findVoteByUserAndPost(userId, postId);

      expect(prismaServiceMock.postVote.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      expect(result).toEqual(mockVote);
    });

    it('should return null if vote is not found', async () => {
      const userId = 'user-id-1';
      const postId = 'post-id-1';

      prismaServiceMock.postVote.findUnique.mockResolvedValue(null);

      const result = await repository.findVoteByUserAndPost(userId, postId);

      expect(prismaServiceMock.postVote.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('deletePostVote', () => {
    it('should delete a post vote by id', async () => {
      const voteId = 'vote-id-1';
      const mockDeletedVote = {
        id: voteId,
        postId: 'post-id-1',
        userId: 'user-id-1',
        createdAt: new Date(),
      };

      prismaServiceMock.postVote.delete.mockResolvedValue(mockDeletedVote);

      await repository.deletePostVote(voteId);

      expect(prismaServiceMock.postVote.delete).toHaveBeenCalledWith({
        where: { id: voteId },
      });
    });
  });
});
