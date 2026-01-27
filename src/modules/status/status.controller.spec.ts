import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RESOURCE_RESOLVER } from 'src/constants';

describe('StatusController', () => {
  let controller: StatusController;
  let statusServiceMock: DeepMockProxy<StatusService>;

  beforeEach(async () => {
    statusServiceMock = mockDeep<StatusService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [
        {
          provide: StatusService,
          useValue: statusServiceMock,
        },
        {
          provide: RESOURCE_RESOLVER,
          useValue: statusServiceMock,
        },
      ],
    }).compile();

    controller = module.get<StatusController>(StatusController);
  });

  describe('create', () => {
    it('should create a new status and return it', async () => {
      const orgId = 'org-id-1';
      const dto: CreateStatusDto = {
        color: '#eacc09ff',
        name: 'In Progress',
        organizationId: orgId,
      };
      const mockCreatedStatus = {
        id: 'status-id-1',
        name: dto.name,
        color: dto.color,
        organizationId: orgId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      };

      statusServiceMock.create.mockResolvedValueOnce(mockCreatedStatus);

      const result = await controller.create(dto);

      expect(result).toEqual(mockCreatedStatus);
      expect(statusServiceMock.create).toHaveBeenCalledWith(dto);
      expect(statusServiceMock.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update an existing status and return it wrapped in data property', async () => {
      const statusId = 'status-id-1';
      const dto: UpdateStatusDto = {
        color: '#00ff00',
        name: 'Completed',
      };
      const mockUpdatedStatus = {
        id: statusId,
        organizationId: 'org-id-1',
        name: 'Completed',
        color: '#00ff00',
        createdAt: new Date(''),
        updatedAt: new Date(''),
        deletedAt: null,
      };

      statusServiceMock.update.mockResolvedValueOnce(mockUpdatedStatus);

      const result = await controller.update(statusId, dto);

      expect(result).toEqual({ data: mockUpdatedStatus });
      expect(statusServiceMock.update).toHaveBeenCalledWith(statusId, dto);
      expect(statusServiceMock.update).toHaveBeenCalledTimes(1);
    });

    it('should allow partial updates', async () => {
      const statusId = 'status-id-2';
      const dto: UpdateStatusDto = {
        color: '#ff0000',
      };
      const mockUpdatedStatus = {
        id: statusId,
        organizationId: 'org-id-1',
        name: 'In Progress',
        color: '#ff0000',
        createdAt: new Date(''),
        updatedAt: new Date(''),
        deletedAt: null,
      };

      statusServiceMock.update.mockResolvedValueOnce(mockUpdatedStatus);

      const result = await controller.update(statusId, dto);

      expect(result).toEqual({ data: mockUpdatedStatus });
      expect(statusServiceMock.update).toHaveBeenCalledWith(statusId, dto);
    });
  });

  describe('remove', () => {
    it('should delete a status successfully', async () => {
      const statusId = 'status-id-1';

      statusServiceMock.remove.mockResolvedValueOnce(undefined);

      const result = await controller.remove(statusId);

      expect(result).toBeUndefined();
      expect(statusServiceMock.remove).toHaveBeenCalledWith(statusId);
      expect(statusServiceMock.remove).toHaveBeenCalledTimes(1);
    });
  });
});
