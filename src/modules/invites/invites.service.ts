import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { InvitesRepository } from './invites.repository';
import { UserPayload } from 'src/common/types/user-payload';
import { MailService } from 'src/shared/modules/mail/mail.service';
import { InviteStatus } from 'src/generated/prisma/enums';
import dayjs from 'src/utils/dayjs';

@Injectable()
export class InvitesService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly invitesRepository: InvitesRepository,
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

    await this.mailService.sendText(
      dto.email,
      'Convite para organização',
      `Você foi convidado para entrar na organização. 
      Use o seguinte link para aceitar o convite: ${this.configService.get('APP_URL')}/accept-invite?token=${token}.
      O convite expira em 7 dias.`,
    );

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

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}
