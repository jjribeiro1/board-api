import { IsOptional, IsString, Length } from 'class-validator';

export class CreateOrganizationDto {
  @IsString({ message: 'Nome inválido' })
  @Length(1, 140, { message: 'Nome deve ter entre 1 e 140 caracteres' })
  name: string;

  @IsString({ message: 'Url inválida' })
  @IsOptional()
  logoUrl?: string;
}
