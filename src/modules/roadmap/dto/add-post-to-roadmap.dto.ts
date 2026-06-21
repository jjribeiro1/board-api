import { IsInt, IsOptional, IsUUID } from 'class-validator';

export class AddPostToRoadmapDto {
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
