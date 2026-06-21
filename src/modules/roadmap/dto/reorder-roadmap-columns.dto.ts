import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ColumnOrder {
  @IsUUID()
  id: string;

  @IsInt()
  order: number;
}

export class ReorderRoadmapColumnsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOrder)
  columns: ColumnOrder[];
}
