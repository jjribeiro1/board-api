export class PostCommentedEventDto {
  constructor(
    readonly postId: string,
    readonly postTitle: string,
    readonly postAuthorId: string,
    readonly commentId: string,
    readonly commentContent: string,
    readonly actorId: string,
    readonly actorName: string,
    readonly organizationId: string,
  ) {}
}

export class PostStatusChangedEventDto {
  constructor(
    readonly postId: string,
    readonly postTitle: string,
    readonly postAuthorId: string,
    readonly oldStatusName: string | null,
    readonly newStatusName: string,
    readonly actorId: string,
    readonly actorName: string,
    readonly organizationId: string,
  ) {}
}
