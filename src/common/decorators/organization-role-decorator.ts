import { SetMetadata } from '@nestjs/common';
import { OrganizationRole } from '../types/user-organization-role';

export const ORG_ROLES_KEY = 'organizationRoles';
export const AllowedOrganizationRoles = (roles: OrganizationRole[]) => SetMetadata(ORG_ROLES_KEY, roles);
