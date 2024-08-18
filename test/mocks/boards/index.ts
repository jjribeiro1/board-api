import { CreateBoardDto } from 'src/modules/boards/dto/create-board.dto';
import { Board } from 'src/modules/boards/entities/board.entity';

export const mockBoardEntity: Board = {
  id: 'any-id',
  title: 'any-title',
  description: 'any-description',
  authorId: 'any-id',
  isLocked: true,
  isPrivate: true,
  organizationId: 'any-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockCreateBoardDto: CreateBoardDto = {
  description: 'any-description',
  organizationId: 'any-id',
  title: 'any-title',
  isLocked: true,
  isPrivate: true,
};

export const mockBoardsRepository = {
  create: jest.fn(),
};
