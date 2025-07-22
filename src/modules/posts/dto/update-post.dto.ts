import { IsOptional, IsString, Length } from 'class-validator';

export class UpdatePostDto {
  /**
   * post title
   * @example 'Add feature X'
   */
  @IsOptional()
  @IsString({ message: 'Título inválido' })
  @Length(3, 200, { message: 'Título deve ter entre 3 e 200 caracteres' })
  title?: string;

  /**
   * post description
   * @example 'Feature X will solve many problems because of this'
   */
  @IsOptional()
  @IsString({ message: 'Descrição inválida' })
  @Length(3, 300, { message: 'Descrição deve ter entre 3 e 300 caracteres' })
  description?: string;
}
