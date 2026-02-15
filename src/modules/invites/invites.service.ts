import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { InvitesRepository } from './invites.repository';
import { UserPayload } from 'src/common/types/user-payload';
import { MailService } from 'src/shared/modules/mail/mail.service';
import { InviteStatus } from 'src/generated/prisma/enums';
import { ResourceOwnershipInfo, ResourceOwnershipResolver } from 'src/common/interfaces/resource-info.interface';
import dayjs from 'src/utils/dayjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/constants/events';
import { InviteCreatedEventDto, InviteRetryEventDto } from '../events/dto/invites-events.dto';

@Injectable()
export class InvitesService implements ResourceOwnershipResolver {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly invitesRepository: InvitesRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateInviteDto, user: UserPayload) {
    const emailExistsInOrg = await this.organizationsService.verifyEmailInOrganization(dto.organizationId, dto.email);
    if (emailExistsInOrg) {
      throw new ConflictException('O usuário já é membro da organização');
    }

    const token = this.generateToken();

    const expiredAt = dayjs().add(7, 'day').toDate();

    const invite = await this.invitesRepository.create(
      {
        email: dto.email,
        organizationId: dto.organizationId,
        expiresAt: expiredAt,
        token,
      },
      user.id,
    );

    this.eventEmitter.emit(EVENTS.invite.created, new InviteCreatedEventDto(invite.email, token));

    return invite;
  }

  async accept(token: string, user: UserPayload) {
    const invite = await this.invitesRepository.findByToken(token);
    if (!invite) {
      throw new NotFoundException('Convite inválido');
    }

    if (dayjs().isAfter(dayjs(invite.expiresAt))) {
      await this.invitesRepository.update(invite.id, { status: InviteStatus.EXPIRED });
      throw new ConflictException('Convite expirado');
    }

    if (invite.email !== user.email) {
      throw new ForbiddenException('Este convite não pertence a este usuário');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new ConflictException('Convite não está mais ativo');
    }

    await this.invitesRepository.acceptInvite({
      invite,
      organization: invite.organization,
      userId: user.id,
    });
  }

  async findByToken(token: string) {
    const invite = await this.invitesRepository.findByToken(token);
    if (!invite) {
      throw new NotFoundException('Convite inválido');
    }

    if (dayjs().isAfter(dayjs(invite.expiresAt))) {
      await this.invitesRepository.update(invite.id, { status: InviteStatus.EXPIRED });
      throw new ConflictException('Convite expirado');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new ConflictException('Convite não está mais ativo');
    }

    return {
      id: invite.id,
      email: invite.email,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      status: invite.status,
      role: invite.role,
      invitedBy: {
        name: invite.invitedBy.name,
      },
      organization: {
        name: invite.organization.name,
      },
    };
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async findOrgAndAuthorId(resourceId: string): Promise<ResourceOwnershipInfo | null> {
    const invite = await this.invitesRepository.findById(resourceId);
    if (!invite) {
      return null;
    }
    return {
      organizationId: invite.organizationId,
      authorId: null,
    };
  }

  async revoke(id: string) {
    const invite = await this.invitesRepository.findById(id);
    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Convite já foi aceito ou expirado');
    }

    return await this.invitesRepository.revoke(id);
  }

  async expireInvites(inviteIds: string[]) {
    await this.invitesRepository.bulkExpire(inviteIds);
  }

  async retryInvite(id: string) {
    const invite = await this.invitesRepository.findById(id);
    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    if (invite.status === InviteStatus.REVOKED) {
      throw new BadRequestException('Não é possível reenviar um convite cancelado');
    }

    if (invite.status === InviteStatus.ACCEPTED) {
      throw new BadRequestException('Convite já foi aceito');
    }

    if (invite.lastRetryAt && dayjs().diff(dayjs(invite.lastRetryAt), 'hour') < 1) {
      throw new BadRequestException('Aguarde pelo menos 1 hora para reenviar o convite');
    }

    const token = this.generateToken();
    const expiredAt = dayjs().add(7, 'day').toDate();

    await this.invitesRepository.update(invite.id, {
      token,
      expiresAt: expiredAt,
      status: InviteStatus.PENDING,
      lastRetryAt: new Date(),
    });

    this.eventEmitter.emit(EVENTS.invite.retry, new InviteRetryEventDto(invite.email, token));

    return;
  }
}
