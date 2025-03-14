export class Post {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly isPrivate: boolean,
    readonly isPinned: boolean,
    readonly isLocked: boolean,
    readonly boardId: string,
    readonly authorId: string,
    readonly status: Status,
    readonly tagsId: string[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}
}

type Status = {
  id: string;
  name: string;
  color: string;
  order: number | null;
};
