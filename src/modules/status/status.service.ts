import { ForbiddenException, Injectable } from '@nestjs/common';
import { StatusRepository } from './status.repository';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UserPayload } from 'src/common/types/user-payload';

@Injectable()
export class StatusService {
  constructor(private readonly statusRepository: StatusRepository) {}

  async findAll(organizationId: string) {
    return this.statusRepository.getAllStatus(organizationId);
  }

  async findOne(statusId: string) {
    return await this.statusRepository.findOne(statusId);
  }

  async create(dto: CreateStatusDto, user: UserPayload, organizationId: string) {
    const userIsOwnerOrAdminFromOrg = user.organizations.some(
      (org) => org.id === organizationId && (org.role === 'OWNER' || org.role === 'ADMIN'),
    );

    if (!userIsOwnerOrAdminFromOrg) {
      throw new ForbiddenException('Usuário não tem permissão para criar status nesta organização');
    }
    return await this.statusRepository.create(dto);
  }

  async update(id: string, dto: UpdateStatusDto) {
    return await this.statusRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.statusRepository.delete(id);
  }

  async createInitialStatusForOrg(organizationId: string) {
    const initialStatus = [
      { name: 'Em revisão', color: '#FFC107' },
      { name: 'Planejado', color: '#6C757D' },
      { name: 'Em progresso', color: '#FD7E14' },
      { name: 'Concluído', color: '#28A745' },
      { name: 'Cancelado', color: '#DC3545' },
    ];

    await this.statusRepository.createMany(initialStatus.map((s) => ({ ...s, organizationId: organizationId })));
    const defaultStatusFromOrg = await this.statusRepository.create({
      name: 'Aberto',
      color: '#007BFF',
      organizationId,
    });

    return { defaultStatusId: defaultStatusFromOrg.id };
  }
}
