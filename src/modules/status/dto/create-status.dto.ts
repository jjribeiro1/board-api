import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStatusDto {
  /**
   * status name
   * @example Completed
   */
  @IsNotEmpty()
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
   * ID of the organization
   * @example eb36e562-3762-45c3-8214-b0688c518d01
   */
  @IsUUID('4')
  organizationId: string;
}
