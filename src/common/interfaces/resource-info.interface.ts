export interface ResourceOwnershipInfo {
  organizationId: string;
  authorId: string | null;
}

export interface ResourceOwnershipResolver {
  findOrgAndAuthorId(resourceId: string): Promise<ResourceOwnershipInfo | null>;
}
