import { Injectable } from '@nestjs/common';
import { StatusRepository } from './status.repository';

@Injectable()
export class StatusService {
  constructor(private readonly statusRepository: StatusRepository) {}
  async findAll(organizationId: string) {
    return this.statusRepository.getAllStatus(organizationId);
  }

  async createDefaultStatusForOrg(organizationId: string) {
    const defaultStatus = ['Aberto', 'Em revisão', 'Planejado', 'Em progresso', 'Concluído', 'Cancelado'];
    await this.statusRepository.createMany(defaultStatus.map((s) => ({ name: s, organizationId: organizationId })));
  }
}
