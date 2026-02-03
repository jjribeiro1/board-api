import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class ListPostsQueryDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsUUID('4', { each: true })
  status?: string[];

  @IsUUID('4', { message: 'ID do board inválido' })
  @IsOptional()
  board?: string;
}
