export const OrganizationRolesOptions = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type OrganizationRole = keyof typeof OrganizationRolesOptions;
