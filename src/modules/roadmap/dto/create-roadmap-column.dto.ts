import { IsString, IsOptional, Length } from 'class-validator';

export class CreateRoadmapColumnDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 50)
  color: string;

  @IsOptional()
  order?: number;
}
