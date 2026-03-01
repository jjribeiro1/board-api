import { IsIn } from 'class-validator';
import { OrganizationRole, OrganizationRolesOptions } from 'src/common/types/user-organization-role';

export class UpdateMemberRoleDto {
  /**
   * new role for the member
   * @example 'ADMIN'
   */
  @IsIn([OrganizationRolesOptions.ADMIN, OrganizationRolesOptions.MEMBER], {
    message: `Role deve ser ${OrganizationRolesOptions.ADMIN} ou ${OrganizationRolesOptions.MEMBER}`,
  })
  role: OrganizationRole;
}
