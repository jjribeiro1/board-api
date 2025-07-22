import { OrganizationRole } from './user-organization-role';

export type UserPayload = {
  id: string;
  name: string;
  email: string;
  organizations: {
    organizationId: string;
    role: OrganizationRole;
  }[];
  createdAt: Date;
  updatedAt: Date;
};
