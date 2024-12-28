import { Injectable } from '@nestjs/common';
import { StatusRepository } from './status.repository';
import { FromOrgOptions, ListStatusQueryDto } from './dto/list-status-query.dto';

@Injectable()
export class StatusService {
  constructor(private readonly statusRepository: StatusRepository) {}
  async findAll(dto: ListStatusQueryDto, organizationId: string) {
    const isFromOrg = dto.fromOrg === FromOrgOptions.true;
    return this.statusRepository.getAllStatus(isFromOrg ? organizationId : null);
  }
}
