import { IsOptional, IsUUID } from 'class-validator';

export class ListBoardPostsQueryDto {
  @IsUUID('4', { message: 'ID do status inválido' })
  @IsOptional()
  status?: string;
}
