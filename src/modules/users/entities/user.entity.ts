export class User {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly organizationIds: string[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}

  toPresentation() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      organizationsIds: this.organizationIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
