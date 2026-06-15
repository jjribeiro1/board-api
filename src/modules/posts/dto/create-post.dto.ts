import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostDto {
  /**
   * post title
   * @example 'Add feature X'
   */
  @IsString({ message: 'Título inválido' })
  title: string;

  /**
   * post description
   * @example 'Feature X will solve many problems because of this'
   */
  @IsString({ message: 'Descrição inválida' })
  description: string;

  /**
   * indicates whether the post is private to an organization
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  /**
   * indicates whether the board is pinned
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  /**
   * indicates whether interactions with the post are stalled
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  /**
   * ID of the board that the post belongs to
   * @example eb36e562-3762-45c3-8214-b0688c518d01
   */
  @IsUUID()
  boardId: string;

  /**
   * Post status ID
   * @example eb36e562-3762-45c3-8214-b0688c518d01
   */
  @IsOptional()
  @IsUUID()
  statusId?: string;

  /**
   * Array of tag IDs to associate with the post
   * @example ["eb36e562-3762-45c3-8214-b0688c518d01", "a1b2c3d4-5678-9abc-def0-123456789abc"]
   */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
