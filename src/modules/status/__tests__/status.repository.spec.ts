import { Test, TestingModule } from '@nestjs/testing';
import { StatusRepository } from '../status.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { createMockContext, MockContext } from 'src/shared/modules/database/prisma/prisma-client-mock';

describe('StatusRepository', () => {
  let repository: StatusRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusRepository, { provide: PrismaService, useValue: mockCtx.prisma }],
    }).compile();

    repository = module.get<StatusRepository>(StatusRepository);
  });

  describe('getAllStatus', () => {
    it('should return all statuses for a given organization', async () => {
      const mockStatuses = [
        { id: 'status-id-1', name: 'Status 1', organizationId: 'org-id', isSystemDefault: false },
        { id: 'status-id-2', name: 'Status 2', organizationId: 'org-id', isSystemDefault: false },
      ];
      mockCtx.prisma.status.findMany.mockResolvedValueOnce(mockStatuses as any);

      const result = await repository.getAllStatus('org-id');
      expect(result).toEqual(mockStatuses);
    });

    it('should return all system default statuses if no organizationId is provided', async () => {
      const mockStatuses = [
        {
          id: 'status-id-1',
          name: 'Status 1',
          organizationId: 'org-id',
          isSystemDefault: false,
          color: '#FAFAFA',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
        {
          id: 'status-id-2',
          name: 'Status 2',
          organizationId: null,
          isSystemDefault: true,
          color: '#FAFAFA',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
      ];
      mockCtx.prisma.status.findMany.mockResolvedValueOnce(await new Promise((resolve) => resolve([mockStatuses[1]])));

      const result = await repository.getAllStatus(null);
      expect(result).toEqual([mockStatuses[1]]);
    });

    it('should return an empty array if no statuses are found', async () => {
      mockCtx.prisma.status.findMany.mockResolvedValueOnce([]);

      const result = await repository.getAllStatus('org-id');
      expect(result).toEqual([]);
    });

    it('should throw an error if PrismaService throws', async () => {
      mockCtx.prisma.status.findMany.mockRejectedValueOnce(new Error('error'));

      await expect(repository.getAllStatus('org-id')).rejects.toThrow(new Error('error'));
    });
  });
});
