import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateBoardDto {
  /**
   * board title
   * @example 'Feedback board'
   */
  @IsString()
  @Length(3, 200, { message: 'Título deve ter entre 3 e 200 caracteres' })
  title: string;

  /**
   * board description
   * @example 'Tell us how we can improve our product'
   */
  @IsString({ message: 'Descrição inválida' })
  @Length(3, 300, { message: 'Descrição deve ter entre 3 e 300 caracteres' })
  description: string;

  /**
   * indicates whether the board is private to an organization
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  /**
   * indicates whether interactions with the board are stalled
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  /**
   * ID of the organization
   * @example eb36e562-3762-45c3-8214-b0688c518d01
   */
  @IsUUID()
  organizationId: string;
}
