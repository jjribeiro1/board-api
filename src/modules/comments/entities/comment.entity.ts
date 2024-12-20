export class Comment {
  constructor(
    readonly id: string,
    readonly content: string,
    readonly authorId: string,
    readonly postId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}
}
