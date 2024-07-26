import { IsString, IsEmail, Length, MaxLength } from 'class-validator';

export class SignInDto {
  /**
   * user email
   * @example 'johndoe@mail.com'
   */
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(200, { message: 'Email não pode ter mais que 200 caracteres' })
  email: string;

  /**
   * user password
   * @example '123456'
   */
  @IsString({ message: 'Senha inválida' })
  @Length(6, 200, { message: 'Senha deve ter entre 6 e 200 caracteres' })
  password: string;
}
