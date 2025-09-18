import { IsArray, IsUUID } from 'class-validator';

export class UpdatePostTagsDto {
  /**
   * Array of tag IDs to associate with the post
   * @example ["eb36e562-3762-45c3-8214-b0688c518d01", "a1b2c3d4-5678-9abc-def0-123456789abc"]
   */
  @IsArray({ message: 'ID das tags deve ser um array' })
  @IsUUID('4', { each: true, message: 'Cada ID deve ser um UUID válido' })
  tagIds: string[];
}
