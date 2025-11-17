import { UserPayload } from 'src/common/types/user-payload';

export const createMockUserPayload = (data?: Partial<UserPayload>): UserPayload => ({
  id: data?.id || 'user-id-1',
  name: data?.name || 'John Doe',
  email: data?.email || 'johndoe@example.com',
  organizations: data?.organizations || [{ id: 'org-id-1', name: 'Example Org', role: 'ADMIN' as const }],
  createdAt: data?.createdAt || new Date(),
  updatedAt: data?.updatedAt || new Date(),
});

export const createMockUser = (data?: Partial<UserPayload & { password?: string; deletedAt?: Date | null }>) => {
  return {
    ...createMockUserPayload(data),
    password: data?.password || 'hashed-password',
    deletedAt: data?.deletedAt || null,
  };
};
