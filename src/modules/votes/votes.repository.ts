import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';

@Injectable()
export class VotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPostVote(postId: string, userId: string): Promise<string> {
    const result = await this.prisma.postVote.create({
      data: {
        postId,
        userId,
      },
    });

    return result.id;
  }

  async findVoteByUserAndPost(userId: string, postId: string) {
    const result = await this.prisma.postVote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!result) {
      return null;
    }

    return result;
  }

  async deletePostVote(voteId: string): Promise<void> {
    await this.prisma.postVote.delete({
      where: { id: voteId },
    });
  }
}
