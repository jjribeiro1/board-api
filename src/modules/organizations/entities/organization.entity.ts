export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
