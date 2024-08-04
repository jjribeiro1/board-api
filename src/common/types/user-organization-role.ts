enum RoleOptions {
  OWNER,
  ADMIN,
  MEMBER,
}

export type Role = keyof typeof RoleOptions;
