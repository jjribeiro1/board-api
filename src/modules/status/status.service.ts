import { Injectable } from '@nestjs/common';
import { StatusRepository } from './status.repository';

@Injectable()
export class StatusService {
  constructor(private readonly statusRepository: StatusRepository) {}
  async findAll(organizationId: string) {
    return this.statusRepository.getAllStatus(organizationId);
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
