import { PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class ManageBoardDto extends PartialType(CreateBoardDto) {}
