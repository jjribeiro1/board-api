import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { CreateRoadmapColumnDto } from './dto/create-roadmap-column.dto';
import { UpdateRoadmapColumnDto } from './dto/update-roadmap-column.dto';
import { ReorderRoadmapColumnsDto } from './dto/reorder-roadmap-columns.dto';
import { AddPostToRoadmapDto } from './dto/add-post-to-roadmap.dto';
import { ReorderRoadmapItemsDto } from './dto/reorder-roadmap-items.dto';
import { RESOURCE_RESOLVER } from 'src/constants';

describe('RoadmapController', () => {
  let controller: RoadmapController;
  let mockRoadmapService: DeepMockProxy<RoadmapService>;

  beforeEach(async () => {
    mockRoadmapService = mockDeep<RoadmapService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapController],
      providers: [
        {
          provide: RoadmapService,
          useValue: mockRoadmapService,
        },
        {
          provide: RESOURCE_RESOLVER,
          useValue: mockRoadmapService,
        },
      ],
    }).compile();

    controller = module.get<RoadmapController>(RoadmapController);
  });

  describe('create', () => {
    it('should create a roadmap and return its ID', async () => {
      const dto: CreateRoadmapDto = {
        name: 'My Roadmap',
        description: 'A description',
        organizationId: 'org-id-1',
      };
      const expectedId = 'roadmap-id-1';

      mockRoadmapService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto);

      expect(mockRoadmapService.create).toHaveBeenCalledWith(dto);
      expect(mockRoadmapService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: { id: expectedId } });
    });

    it('should create a roadmap without description', async () => {
      const dto: CreateRoadmapDto = {
        name: 'Minimal Roadmap',
        organizationId: 'org-id-1',
      };
      const expectedId = 'roadmap-id-2';

      mockRoadmapService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto);

      expect(mockRoadmapService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ data: { id: expectedId } });
    });
  });

  describe('findOne', () => {
    it('should return a roadmap wrapped in a data key', async () => {
      const roadmapId = 'roadmap-id-1';
      const roadmap = {
        id: roadmapId,
        name: 'My Roadmap',
        description: 'A description',
        slug: 'my-roadmap',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRoadmapService.findOne.mockResolvedValue(roadmap as any);

      const result = await controller.findOne(roadmapId);

      expect(mockRoadmapService.findOne).toHaveBeenCalledWith(roadmapId);
      expect(mockRoadmapService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: roadmap });
    });
  });

  describe('update', () => {
    it('should update a roadmap and return it wrapped in data property', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: UpdateRoadmapDto = {
        name: 'Updated Roadmap',
        description: 'Updated description',
      };
      const updatedRoadmap = {
        id: roadmapId,
        name: 'Updated Roadmap',
        description: 'Updated description',
        slug: 'updated-roadmap',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRoadmapService.update.mockResolvedValue(updatedRoadmap as any);

      const result = await controller.update(roadmapId, dto);

      expect(mockRoadmapService.update).toHaveBeenCalledWith(roadmapId, dto);
      expect(mockRoadmapService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: updatedRoadmap });
    });

    it('should allow partial updates', async () => {
      const roadmapId = 'roadmap-id-2';
      const dto: UpdateRoadmapDto = {
        name: 'Only Name Updated',
      };
      const updatedRoadmap = {
        id: roadmapId,
        name: 'Only Name Updated',
        description: 'Original description',
        slug: 'only-name-updated',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRoadmapService.update.mockResolvedValue(updatedRoadmap as any);

      const result = await controller.update(roadmapId, dto);

      expect(mockRoadmapService.update).toHaveBeenCalledWith(roadmapId, dto);
      expect(result).toEqual({ data: updatedRoadmap });
    });
  });

  describe('remove', () => {
    it('should delete a roadmap successfully', async () => {
      const roadmapId = 'roadmap-id-1';

      mockRoadmapService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(roadmapId);

      expect(mockRoadmapService.remove).toHaveBeenCalledWith(roadmapId);
      expect(mockRoadmapService.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('addColumn', () => {
    it('should add a column to a roadmap and return its ID', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: CreateRoadmapColumnDto = {
        name: 'To Do',
        color: '#ff0000',
      };
      const expectedId = 'column-id-1';

      mockRoadmapService.addColumn.mockResolvedValue(expectedId);

      const result = await controller.addColumn(roadmapId, dto);

      expect(mockRoadmapService.addColumn).toHaveBeenCalledWith(roadmapId, dto);
      expect(mockRoadmapService.addColumn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: { id: expectedId } });
    });

    it('should add a column with order', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: CreateRoadmapColumnDto = {
        name: 'In Progress',
        color: '#00ff00',
        order: 2,
      };
      const expectedId = 'column-id-2';

      mockRoadmapService.addColumn.mockResolvedValue(expectedId);

      const result = await controller.addColumn(roadmapId, dto);

      expect(mockRoadmapService.addColumn).toHaveBeenCalledWith(roadmapId, dto);
      expect(result).toEqual({ data: { id: expectedId } });
    });
  });

  describe('updateColumn', () => {
    it('should update a column and return it wrapped in data property', async () => {
      const columnId = 'column-id-1';
      const dto: UpdateRoadmapColumnDto = {
        name: 'Done',
        color: '#0000ff',
      };
      const updatedColumn = {
        id: columnId,
        name: 'Done',
        color: '#0000ff',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRoadmapService.updateColumn.mockResolvedValue(updatedColumn as any);

      const result = await controller.updateColumn(columnId, dto);

      expect(mockRoadmapService.updateColumn).toHaveBeenCalledWith(columnId, dto);
      expect(mockRoadmapService.updateColumn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: updatedColumn });
    });
  });

  describe('deleteColumn', () => {
    it('should delete a column successfully', async () => {
      const columnId = 'column-id-1';

      mockRoadmapService.deleteColumn.mockResolvedValue(undefined);

      const result = await controller.deleteColumn(columnId);

      expect(mockRoadmapService.deleteColumn).toHaveBeenCalledWith(columnId);
      expect(mockRoadmapService.deleteColumn).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('reorderColumns', () => {
    it('should reorder columns successfully', async () => {
      const dto: ReorderRoadmapColumnsDto = {
        columns: [
          { id: 'column-id-1', order: 2 },
          { id: 'column-id-2', order: 1 },
          { id: 'column-id-3', order: 3 },
        ],
      };

      mockRoadmapService.reorderColumns.mockResolvedValue(undefined);

      const result = await controller.reorderColumns(dto);

      expect(mockRoadmapService.reorderColumns).toHaveBeenCalledWith(dto);
      expect(mockRoadmapService.reorderColumns).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('addPostToColumn', () => {
    it('should add a post to a column and return its item ID', async () => {
      const columnId = 'column-id-1';
      const dto: AddPostToRoadmapDto = {
        postId: 'post-id-1',
      };
      const expectedId = 'item-id-1';

      mockRoadmapService.addPostToColumn.mockResolvedValue(expectedId);

      const result = await controller.addPostToColumn(columnId, dto);

      expect(mockRoadmapService.addPostToColumn).toHaveBeenCalledWith(columnId, dto);
      expect(mockRoadmapService.addPostToColumn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: { id: expectedId } });
    });

    it('should add a post with order', async () => {
      const columnId = 'column-id-1';
      const dto: AddPostToRoadmapDto = {
        postId: 'post-id-2',
        order: 3,
      };
      const expectedId = 'item-id-2';

      mockRoadmapService.addPostToColumn.mockResolvedValue(expectedId);

      const result = await controller.addPostToColumn(columnId, dto);

      expect(mockRoadmapService.addPostToColumn).toHaveBeenCalledWith(columnId, dto);
      expect(result).toEqual({ data: { id: expectedId } });
    });
  });

  describe('removeItem', () => {
    it('should remove an item from a roadmap successfully', async () => {
      const itemId = 'item-id-1';

      mockRoadmapService.removeItem.mockResolvedValue(undefined);

      const result = await controller.removeItem(itemId);

      expect(mockRoadmapService.removeItem).toHaveBeenCalledWith(itemId);
      expect(mockRoadmapService.removeItem).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('reorderItems', () => {
    it('should reorder items in a column successfully', async () => {
      const columnId = 'column-id-1';
      const dto: ReorderRoadmapItemsDto = {
        items: [
          { id: 'item-id-1', order: 2 },
          { id: 'item-id-2', order: 1 },
          { id: 'item-id-3', order: 3 },
        ],
      };

      mockRoadmapService.reorderItems.mockResolvedValue(undefined);

      const result = await controller.reorderItems(columnId, dto);

      expect(mockRoadmapService.reorderItems).toHaveBeenCalledWith(columnId, dto);
      expect(mockRoadmapService.reorderItems).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
