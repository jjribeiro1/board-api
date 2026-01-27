import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { StatusRepository } from './status.repository';

describe('StatusService', () => {
  let service: StatusService;
  let statusRepositoryMock: DeepMockProxy<StatusRepository>;

  beforeEach(async () => {
    statusRepositoryMock = mockDeep<StatusRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: StatusRepository,
          useValue: statusRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<StatusService>(StatusService);
  });

  describe('findOne', () => {
    it('should return a status when found', async () => {
      const statusId = 'status-id-1';
      const mockStatus = {
        id: statusId,
        name: 'In Progress',
        color: '#00ff00',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      statusRepositoryMock.findOne.mockResolvedValueOnce(mockStatus);

      const result = await service.findOne(statusId);

      expect(result).toBe(mockStatus);
      expect(statusRepositoryMock.findOne).toHaveBeenCalledWith(statusId);
      expect(statusRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when status is not found', async () => {
      const statusId = 'non-existent-id';

      statusRepositoryMock.findOne.mockResolvedValueOnce(null);

      const result = await service.findOne(statusId);

      expect(result).toBeNull();
      expect(statusRepositoryMock.findOne).toHaveBeenCalledWith(statusId);
      expect(statusRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new status', async () => {
      const organizationId = 'org-id-1';

      const dto: CreateStatusDto = {
        name: 'In Progress',
        color: '#00ff00',
        organizationId,
      };
      const mockCreatedStatus = {
        id: 'status-id-1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      statusRepositoryMock.create.mockResolvedValueOnce(mockCreatedStatus);

      const result = await service.create(dto);

      expect(result).toBe(mockCreatedStatus);
      expect(statusRepositoryMock.create).toHaveBeenCalledWith(dto);
      expect(statusRepositoryMock.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update the status and return the updated status', async () => {
      const statusId = 'status-id-1';
      const dto: UpdateStatusDto = {
        name: 'In Review',
        color: '#0000ff',
      };
      const mockUpdatedStatus = {
        id: statusId,
        name: 'In Review',
        color: '#0000ff',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      statusRepositoryMock.update.mockResolvedValueOnce(mockUpdatedStatus);

      const result = await service.update(statusId, dto);

      expect(result).toBe(mockUpdatedStatus);
      expect(statusRepositoryMock.update).toHaveBeenCalledWith(statusId, dto);
      expect(statusRepositoryMock.update).toHaveBeenCalledTimes(1);
    });

    it('should allow partial updates', async () => {
      const statusId = 'status-id-1';
      const dto: UpdateStatusDto = {
        name: 'Completed',
      };
      const mockUpdatedStatus = {
        id: statusId,
        name: 'Completed',
        color: '#ff0000',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      statusRepositoryMock.update.mockResolvedValueOnce(mockUpdatedStatus);

      const result = await service.update(statusId, dto);

      expect(result).toBe(mockUpdatedStatus);
      expect(statusRepositoryMock.update).toHaveBeenCalledWith(statusId, dto);
      expect(statusRepositoryMock.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delete the status', async () => {
      const statusId = 'status-id-1';

      statusRepositoryMock.delete.mockResolvedValueOnce();

      await service.remove(statusId);

      expect(statusRepositoryMock.delete).toHaveBeenCalledWith(statusId);
      expect(statusRepositoryMock.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if deletion fails', async () => {
      const statusId = 'status-id-1';
      const error = new Error('Database error');

      statusRepositoryMock.delete.mockRejectedValueOnce(error);

      await expect(service.remove(statusId)).rejects.toThrow('Database error');

      expect(statusRepositoryMock.delete).toHaveBeenCalledWith(statusId);
      expect(statusRepositoryMock.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('createInitialStatusForOrg', () => {
    it('should create initial status for the organization and return default status ID', async () => {
      const organizationId = 'org-id-1';
      const initialStatus = [
        { name: 'Em revisão', color: '#FFC107' },
        { name: 'Planejado', color: '#6C757D' },
        { name: 'Em progresso', color: '#FD7E14' },
        { name: 'Concluído', color: '#28A745' },
        { name: 'Cancelado', color: '#DC3545' },
      ];
      const defaultStatus = {
        name: 'Aberto',
        color: '#007BFF',
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const expectedId = 'default-status-id';

      statusRepositoryMock.create.mockResolvedValueOnce({ ...defaultStatus, id: expectedId });

      const result = await service.createInitialStatusForOrg(organizationId);

      expect(statusRepositoryMock.createMany).toHaveBeenCalledWith(
        initialStatus.map((s) => ({ ...s, organizationId: organizationId })),
      );
      expect(statusRepositoryMock.createMany).toHaveBeenCalledTimes(1);

      expect(statusRepositoryMock.create).toHaveBeenCalledWith({
        name: defaultStatus.name,
        color: defaultStatus.color,
        organizationId,
      });
      expect(statusRepositoryMock.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual({ defaultStatusId: expectedId });
    });
  });
});
