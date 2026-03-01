import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class ListBoardPostsQueryDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsUUID('4', { each: true })
  status?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsUUID('4', { each: true })
  tag?: string[];
}
