import { IsOptional, IsString, Length } from 'class-validator';

export class CreateOrganizationDto {
  /**
   * Name of organization
   * @example 'Meta'
   */
  @IsString({ message: 'Nome inválido' })
  @Length(1, 140, { message: 'Nome deve ter entre 1 e 140 caracteres' })
  name: string;

  /**
   * Url of logo image
   */
  @IsString({ message: 'Url inválida' })
  @IsOptional()
  logoUrl: string | null;
}
