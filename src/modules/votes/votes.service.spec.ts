import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { VotesService } from './votes.service';
import { VotesRepository } from './votes.repository';

describe('VotesService', () => {
  let votesService: VotesService;
  let votesRepositoryMock: DeepMockProxy<VotesRepository>;

  beforeEach(async () => {
    votesRepositoryMock = mockDeep<VotesRepository>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        VotesService,
        {
          provide: VotesRepository,
          useValue: votesRepositoryMock,
        },
      ],
    }).compile();

    votesService = moduleRef.get<VotesService>(VotesService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('togglePostVote', () => {
    const postId = 'post-id-1';
    const userId = 'user-id-1';
    const voteId = 'vote-id-1';

    it('should create a vote when user has not voted yet', async () => {
      votesRepositoryMock.findVoteByUserAndPost.mockResolvedValue(null);
      votesRepositoryMock.createPostVote.mockResolvedValue(voteId);

      const result = await votesService.togglePostVote(postId, userId);

      expect(result).toEqual({
        id: voteId,
        message: 'Voto adicionado com sucesso',
        voted: true,
      });
      expect(votesRepositoryMock.findVoteByUserAndPost).toHaveBeenCalledWith(userId, postId);
      expect(votesRepositoryMock.findVoteByUserAndPost).toHaveBeenCalledTimes(1);
      expect(votesRepositoryMock.createPostVote).toHaveBeenCalledWith(postId, userId);
      expect(votesRepositoryMock.createPostVote).toHaveBeenCalledTimes(1);
      expect(votesRepositoryMock.deletePostVote).not.toHaveBeenCalled();
    });

    it('should remove vote when user has already voted', async () => {
      const existingVote = {
        id: voteId,
        postId,
        userId,
        createdAt: new Date(),
      };

      votesRepositoryMock.findVoteByUserAndPost.mockResolvedValue(existingVote);
      votesRepositoryMock.deletePostVote.mockResolvedValue(undefined);

      const result = await votesService.togglePostVote(postId, userId);

      expect(result).toEqual({
        message: 'Voto removido com sucesso',
        voted: false,
      });
      expect(votesRepositoryMock.findVoteByUserAndPost).toHaveBeenCalledWith(userId, postId);
      expect(votesRepositoryMock.findVoteByUserAndPost).toHaveBeenCalledTimes(1);
      expect(votesRepositoryMock.deletePostVote).toHaveBeenCalledWith(voteId);
      expect(votesRepositoryMock.deletePostVote).toHaveBeenCalledTimes(1);
      expect(votesRepositoryMock.createPostVote).not.toHaveBeenCalled();
    });

    it('should handle multiple toggle operations correctly', async () => {
      // First call - no existing vote, should create
      votesRepositoryMock.findVoteByUserAndPost.mockResolvedValueOnce(null);
      votesRepositoryMock.createPostVote.mockResolvedValueOnce(voteId);

      const firstResult = await votesService.togglePostVote(postId, userId);

      expect(firstResult.voted).toBe(true);
      expect(firstResult.id).toBe(voteId);

      // Second call - existing vote, should delete
      const existingVote = {
        id: voteId,
        postId,
        userId,
        createdAt: new Date(),
      };

      votesRepositoryMock.findVoteByUserAndPost.mockResolvedValueOnce(existingVote);
      votesRepositoryMock.deletePostVote.mockResolvedValueOnce(undefined);

      const secondResult = await votesService.togglePostVote(postId, userId);

      expect(secondResult.voted).toBe(false);
      expect(secondResult).not.toHaveProperty('id');
    });
  });
});
