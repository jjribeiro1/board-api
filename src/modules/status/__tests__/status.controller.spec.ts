import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from '../status.controller';
import { StatusService } from '../status.service';
import { FromOrgOptions, ListStatusQueryDto } from '../dto/list-status-query.dto';

describe('StatusController', () => {
  let controller: StatusController;
  const mockStatusService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [{ provide: StatusService, useValue: mockStatusService }],
    }).compile();

    controller = module.get<StatusController>(StatusController);
  });

  describe('findAll', () => {
    it('should call StatusService with correct values', async () => {
      const dto: ListStatusQueryDto = { fromOrg: FromOrgOptions.true };
      const req = { cookies: { 'org-id': 'org-id' } } as any;

      await controller.findAll(dto, req);

      expect(mockStatusService.findAll).toHaveBeenCalledWith(dto, 'org-id');
    });

    it('should return status data', async () => {
      const dto: ListStatusQueryDto = { fromOrg: FromOrgOptions.true };
      const req = { cookies: { 'org-id': 'org-id' } } as any;
      const mockStatus = [{ id: 'status-id', name: 'status-name' }];
      mockStatusService.findAll.mockResolvedValueOnce(mockStatus);

      const result = await controller.findAll(dto, req);

      expect(result).toEqual({ data: mockStatus });
    });
  });
});
