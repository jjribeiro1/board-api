export class Status {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly color: string,
    readonly organizationId: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}
}
