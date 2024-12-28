import { IsEnum, IsOptional } from 'class-validator';

export enum FromOrgOptions {
  true = '1',
  false = '0',
}

export class ListStatusQueryDto {
  @IsEnum(FromOrgOptions)
  @IsOptional()
  fromOrg?: FromOrgOptions;
}
