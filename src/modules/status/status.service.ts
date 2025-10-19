import { Injectable } from '@nestjs/common';
import { StatusRepository } from './status.repository';

@Injectable()
export class StatusService {
  constructor(private readonly statusRepository: StatusRepository) {}
  async findAll(organizationId: string) {
    return this.statusRepository.getAllStatus(organizationId);
  }

  async createDefaultStatusForOrg(organizationId: string) {
    const defaultStatus = [
      { name: 'Aberto', color: '#007BFF' },
      { name: 'Em revisão', color: '#FFC107' },
      { name: 'Planejado', color: '#6C757D' },
      { name: 'Em progresso', color: '#FD7E14' },
      { name: 'Concluído', color: '#28A745' },
      { name: 'Cancelado', color: '#DC3545' },
    ];
    await this.statusRepository.createMany(defaultStatus.map((s) => ({ ...s, organizationId: organizationId })));
  }
}
