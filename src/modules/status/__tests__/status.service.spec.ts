import { Test, TestingModule } from '@nestjs/testing';
import { StatusService } from '../status.service';
import { StatusRepository } from '../status.repository';
import { ListStatusQueryDto, FromOrgOptions } from '../dto/list-status-query.dto';
import { mockStatusRepository } from 'test/mocks/status';

describe('StatusService', () => {
  let service: StatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusService, { provide: StatusRepository, useValue: mockStatusRepository }],
    }).compile();

    service = module.get<StatusService>(StatusService);
  });

  describe('findAll', () => {
    it('should call StatusRepository with organizationId if fromOrg is true', async () => {
      const dto: ListStatusQueryDto = { fromOrg: FromOrgOptions.true };
      const organizationId = 'org-id';
      await service.findAll(dto, organizationId);
      expect(mockStatusRepository.getAllStatus).toHaveBeenCalledWith(organizationId);
    });

    it('should call StatusRepository with null if fromOrg is false', async () => {
      const dto: ListStatusQueryDto = { fromOrg: FromOrgOptions.false };
      await service.findAll(dto, 'org-id');
      expect(mockStatusRepository.getAllStatus).toHaveBeenCalledWith(null);
    });

    it('should return the result from StatusRepository', async () => {
      const dto: ListStatusQueryDto = { fromOrg: FromOrgOptions.true };
      const mockStatuses = [{ id: 'status-id', name: 'status-name' }];
      mockStatusRepository.getAllStatus.mockResolvedValueOnce(mockStatuses);

      const result = await service.findAll(dto, 'org-id');
      expect(result).toBe(mockStatuses);
    });
  });
});
