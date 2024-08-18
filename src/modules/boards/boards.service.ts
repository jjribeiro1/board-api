import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardsRepository } from './boards.repository';

@Injectable()
export class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  async create(dto: CreateBoardDto, userId: string) {
    return this.boardsRepository.create(dto, userId);
  }
}
