import { Injectable } from '@nestjs/common';
import { VotesRepository } from './votes.repository';

@Injectable()
export class VotesService {
  constructor(private readonly votesRepository: VotesRepository) {}

  async togglePostVote(postId: string, userId: string) {
    const existingVote = await this.votesRepository.findVoteByUserAndPost(userId, postId);

    if (existingVote) {
      await this.votesRepository.deletePostVote(existingVote.id);
      return {
        message: 'Voto removido com sucesso',
        voted: false,
      };
    }

    const voteId = await this.votesRepository.createPostVote(postId, userId);

    return {
      id: voteId,
      message: 'Voto adicionado com sucesso',
      voted: true,
    };
  }
}
