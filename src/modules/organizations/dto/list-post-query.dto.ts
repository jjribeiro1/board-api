import { IsOptional, IsUUID } from 'class-validator';

export class ListPostsQueryDto {
  @IsUUID('4', { message: 'ID do status inválido' })
  @IsOptional()
  status?: string;

  @IsUUID('4', { message: 'ID do board inválido' })
  @IsOptional()
  board?: string;
}
