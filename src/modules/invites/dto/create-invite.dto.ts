import { IsEmail, IsIn, IsUUID, MaxLength } from 'class-validator';
import { OrganizationRole, OrganizationRolesOptions } from 'src/common/types/user-organization-role';

export class CreateInviteDto {
  /**
   * user email
   * @example 'johndoe@mail.com'
   */
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(200, { message: 'Email não pode ter mais que 200 caracteres' })
  email: string;

  /**
   * ID of the organization
   * @example eb36e562-3762-45c3-8214-b0688c518d01
   */
  @IsUUID()
  organizationId: string;

  /**
   * role in the organization
   * @example 'MEMBER'
   */
  @IsIn([OrganizationRolesOptions.MEMBER], { message: `Role deve ser ${OrganizationRolesOptions.MEMBER}` })
  role: OrganizationRole;
}
