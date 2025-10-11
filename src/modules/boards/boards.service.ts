import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { ManageBoardDto } from './dto/manage-board.dto';
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

  async findPostsFromBoard(boardId: string, userId: string) {
    await this.findOne(boardId);
    return this.boardsRepository.findPostsFromBoard(boardId, userId);
  }

  async manageBoard(boardId: string, dto: ManageBoardDto) {
    await this.findOne(boardId);
    return this.boardsRepository.update(boardId, dto);
  }

  async remove(boardId: string): Promise<void> {
    await this.findOne(boardId);
    await this.boardsRepository.delete(boardId);
  }
}
