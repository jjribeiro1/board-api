import { Transform, plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  SERVER_PORT: number;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;

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
