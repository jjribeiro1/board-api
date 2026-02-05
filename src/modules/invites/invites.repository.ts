import { Injectable } from '@nestjs/common';
import { Organization, OrganizationInvite } from 'src/generated/prisma/client';
import { InviteStatus } from 'src/generated/prisma/enums';
import { OrganizationInviteUpdateInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';

type CreateInvite = {
  email: string;
  organizationId: string;
  expiresAt: Date;
  token: string;
};

type AcceptInvite = {
  invite: OrganizationInvite;
  organization: Organization;
  userId: string;
};

@Injectable()
export class InvitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvite, userId: string) {
    const invite = await this.prisma.organizationInvite.create({
      data: {
        email: dto.email,
        organizationId: dto.organizationId,
        expiresAt: dto.expiresAt,
        token: dto.token,
        invitedById: userId,
      },
    });

    return invite.id;
  }

  async findByToken(token: string) {
    const invite = await this.prisma.organizationInvite.findUnique({
      where: { token },
      include: { organization: true, invitedBy: true },
    });
    return invite;
  }

  async update(id: string, dto: OrganizationInviteUpdateInput) {
    await this.prisma.organizationInvite.update({
      where: { id },
      data: { ...dto },
    });
  }

  async acceptInvite(dto: AcceptInvite) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.organizationInvite.update({
        where: { id: dto.invite.id },
        data: { status: InviteStatus.ACCEPTED, acceptedAt: new Date() },
      });

      await tx.userOrganization.create({
        data: {
          organizationId: dto.organization.id,
          userId: dto.userId,
          role: dto.invite.role,
          name: dto.organization.name,
        },
      });
    });
  }

  async findById(id: string) {
    const invite = await this.prisma.organizationInvite.findUnique({
      where: { id },
      include: { organization: true },
    });
    return invite;
  }

  async revoke(id: string) {
    await this.prisma.organizationInvite.update({
      where: { id },
      data: { status: InviteStatus.REVOKED },
    });
  }
}
