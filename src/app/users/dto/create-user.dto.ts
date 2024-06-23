import { IsString, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 200)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 200)
  password: string;
}
