export class Board {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly isPrivate: boolean,
    readonly isLocked: boolean,
    readonly organizationId: string,
    readonly authorId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}
}
