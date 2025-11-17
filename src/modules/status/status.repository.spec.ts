import { Test, TestingModule } from '@nestjs/testing';
import { StatusRepository } from './status.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

describe('StatusRepository', () => {
  let repository: StatusRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<StatusRepository>(StatusRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllStatus', () => {
    it('should return all non-deleted status for an organization', async () => {
      const organizationId = 'org-id-1';
      const mockStatuses = [
        {
          id: 'status-id-1',
          name: 'To Do',
          color: '#FF5733',
          organizationId: organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'status-id-2',
          name: 'In Progress',
          color: '#FFC300',
          organizationId: organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      prismaServiceMock.status.findMany.mockResolvedValue(mockStatuses);

      const result = await repository.getAllStatus(organizationId);

      expect(prismaServiceMock.status.findMany).toHaveBeenCalledWith({
        where: {
          organizationId,
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockStatuses);
    });

    it('should return an empty array if organization has no status', async () => {
      const organizationId = 'org-id-1';

      prismaServiceMock.status.findMany.mockResolvedValue([]);

      const result = await repository.getAllStatus(organizationId);

      expect(prismaServiceMock.status.findMany).toHaveBeenCalledWith({
        where: {
          organizationId,
          deletedAt: null,
        },
      });

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a status and return the created status', async () => {
      const dto: CreateStatusDto = {
        name: 'Done',
        color: '#28B463',
        organizationId: 'org-id-1',
      };
      const mockStatus = {
        id: 'status-id-1',
        name: dto.name,
        color: dto.color,
        organizationId: dto.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.status.create.mockResolvedValue(mockStatus);

      const result = await repository.create(dto);

      expect(prismaServiceMock.status.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          color: dto.color,
          organizationId: dto.organizationId,
        },
      });

      expect(result).toEqual(mockStatus);
    });
  });

  describe('createMany', () => {
    it('should create multiple statuses', async () => {
      const dtos: CreateStatusDto[] = [
        {
          name: 'Backlog',
          color: '#909497',
          organizationId: 'org-id-1',
        },
        {
          name: 'Review',
          color: '#3498DB',
          organizationId: 'org-id-1',
        },
      ];

      prismaServiceMock.status.createMany.mockResolvedValue({ count: 2 });

      await repository.createMany(dtos);

      expect(prismaServiceMock.status.createMany).toHaveBeenCalledWith({
        data: dtos.map((value) => ({ ...value })),
      });
    });
  });

  describe('update', () => {
    it('should update a status and return the updated status', async () => {
      const statusId = 'status-id-1';
      const dto: UpdateStatusDto = {
        name: 'Updated Status',
        color: '#E74C3C',
      };
      const mockUpdatedStatus = {
        id: statusId,
        name: 'Updated Status',
        color: '#E74C3C',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.status.update.mockResolvedValue(mockUpdatedStatus);

      const result = await repository.update(statusId, dto);

      expect(prismaServiceMock.status.update).toHaveBeenCalledWith({
        where: { id: statusId },
        data: {
          name: dto.name,
          color: dto.color,
        },
      });

      expect(result).toEqual(mockUpdatedStatus);
    });
  });

  describe('findOne', () => {
    it('should find and return a status by id', async () => {
      const statusId = 'status-id-1';
      const mockStatus = {
        id: statusId,
        name: 'In Progress',
        color: '#FFC300',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.status.findUnique.mockResolvedValue(mockStatus);

      const result = await repository.findOne(statusId);

      expect(prismaServiceMock.status.findUnique).toHaveBeenCalledWith({
        where: { id: statusId, deletedAt: null },
      });

      expect(result).toEqual(mockStatus);
    });

    it('should return null if status is not found', async () => {
      const statusId = 'non-existent-status-id';

      prismaServiceMock.status.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(statusId);

      expect(prismaServiceMock.status.findUnique).toHaveBeenCalledWith({
        where: { id: statusId, deletedAt: null },
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should soft delete a status by setting deletedAt', async () => {
      const statusId = 'status-id-1';
      const mockDeletedStatus = {
        id: statusId,
        name: 'To Do',
        color: '#FF5733',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      prismaServiceMock.status.update.mockResolvedValue(mockDeletedStatus);

      await repository.delete(statusId);

      expect(prismaServiceMock.status.update).toHaveBeenCalledWith({
        where: { id: statusId },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });
  });
});
