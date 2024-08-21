import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardsRepository } from './boards.repository';

@Injectable()
export class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  async create(dto: CreateBoardDto, userId: string) {
    return this.boardsRepository.create(dto, userId);
  }

  async findOne(boardId: string) {
    const board = await this.boardsRepository.findOne(boardId);
    if (!board) {
      throw new NotFoundException(`board com id: ${boardId} não encontrado`);
    }

    return board;
  }

  async findPostsFromBoard(boardId: string) {
    await this.findOne(boardId);
    return this.boardsRepository.findPostsFromBoard(boardId);
  }
}
