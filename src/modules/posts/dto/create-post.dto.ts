import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreatePostDto {
  /**
   * post title
   * @example 'Add feature X'
   */
  @IsString({ message: 'Título inválido' })
  @Length(3, 200, { message: 'Título deve ter entre 3 e 200 caracteres' })
  title: string;

  /**
   * post description
   * @example 'Feature X will solve many problems because of this'
   */
  @IsString({ message: 'Descrição inválida' })
  @Length(3, 300, { message: 'Descrição deve ter entre 3 e 300 caracteres' })
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
  @IsUUID()
  statusId: string;
}
