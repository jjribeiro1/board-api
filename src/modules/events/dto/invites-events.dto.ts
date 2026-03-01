export class InvitesExpiredEventDto {
  constructor(readonly inviteIds: string[]) {}
}

export class InviteRetryEventDto {
  constructor(
    readonly email: string,
    readonly token: string,
  ) {}
}

export class InviteCreatedEventDto {
  constructor(
    readonly email: string,
    readonly token: string,
  ) {}
}
