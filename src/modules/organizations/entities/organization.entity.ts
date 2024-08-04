import { Role } from 'src/common/types/user-organization-role';

export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly logoUrl: string | null,
    readonly members: Member[],
    readonly organizationStatus: Status[],
    readonly organizationTags: Tag[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}

type Member = {
  id: string;
  userId: string;
  role: Role;
  organizationId: string;
};

type Status = {
  id: string;
  name: string;
  color: string;
};

type Tag = {
  id: string;
  name: string;
  color: string;
};
