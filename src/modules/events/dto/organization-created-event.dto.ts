export class OrganizationCreatedEventDto {
  constructor(
    readonly organizationId: string,
    readonly ownerId: string,
  ) {}
}
