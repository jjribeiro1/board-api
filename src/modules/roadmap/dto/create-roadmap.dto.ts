import { IsString, IsOptional, IsUUID, Length } from 'class-validator';

export class CreateRoadmapDto {
  @IsString()
  @Length(1, 140)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  organizationId: string;
}
