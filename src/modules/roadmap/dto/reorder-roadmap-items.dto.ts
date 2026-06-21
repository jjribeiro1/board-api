import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RoadmapItemOrder {
  @IsUUID()
  id: string;

  @IsInt()
  order: number;
}

export class ReorderRoadmapItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoadmapItemOrder)
  items: RoadmapItemOrder[];
}
