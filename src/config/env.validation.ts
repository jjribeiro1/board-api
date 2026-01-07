import { Transform, plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, validateSync, IsEmail } from 'class-validator';

export class EnvironmentVariables {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  PORT: number;

  @IsString()
  @IsNotEmpty()
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  CLIENT_DOMAIN: string;

  @IsString()
  @IsNotEmpty()
  CLIENT_URL: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_PUBLIC_KEY: string;

  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_PUBLIC_KEY: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_PRIVATE_KEY: string;

  @IsEmail()
  @IsNotEmpty()
  MAIL_FROM: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
