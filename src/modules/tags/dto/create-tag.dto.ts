import { IsNotEmpty, IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateTagDto {
  /**
   * Tag name
   * @example Frontend
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  /**
   * Tag color in hex format
   * @example #FF5733
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  color: string;

  /**
   * ID of the organization (optional for system default tags)
   * @example eb36e562-3762-45c3-8214-b0688c518d01
   */
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;
}
