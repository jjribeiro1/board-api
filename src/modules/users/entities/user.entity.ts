import { Role } from '@prisma/client';

export class User {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly organizations: Array<{ organizationId: string; name: string; role: Role }>,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}

  toPresentation() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      organizations: this.organizations,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
