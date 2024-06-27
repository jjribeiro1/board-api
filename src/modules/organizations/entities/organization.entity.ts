export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly logoUrl: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
