import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapRepository } from './roadmap.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'src/generated/prisma/client';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { CreateRoadmapColumnDto } from './dto/create-roadmap-column.dto';
import { UpdateRoadmapColumnDto } from './dto/update-roadmap-column.dto';
import { AddPostToRoadmapDto } from './dto/add-post-to-roadmap.dto';
import { ReorderRoadmapColumnsDto } from './dto/reorder-roadmap-columns.dto';
import { ReorderRoadmapItemsDto } from './dto/reorder-roadmap-items.dto';

describe('RoadmapRepository', () => {
  let repository: RoadmapRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<RoadmapRepository>(RoadmapRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a roadmap and return its id', async () => {
      const expectedId = 'roadmap-id-1';
      const slug = 'my-roadmap';
      const dto: CreateRoadmapDto = {
        name: 'My Roadmap',
        description: 'A description',
        organizationId: 'org-id-1',
      };
      const mockRoadmap = {
        id: expectedId,
        name: dto.name,
        description: dto.description as string,
        slug,
        organizationId: dto.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.roadmap.create.mockResolvedValue(mockRoadmap);

      const result = await repository.create(dto, slug);

      expect(prismaServiceMock.roadmap.create).toHaveBeenCalledWith({
        data: { name: dto.name, description: dto.description, slug, organizationId: dto.organizationId },
      });
      expect(result).toBe(expectedId);
    });

    it('should create a roadmap without description', async () => {
      const expectedId = 'roadmap-id-2';
      const slug = 'minimal';
      const dto: CreateRoadmapDto = {
        name: 'Minimal',
        organizationId: 'org-id-1',
      };
      const mockRoadmap = {
        id: expectedId,
        name: dto.name,
        description: null,
        slug,
        organizationId: dto.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.roadmap.create.mockResolvedValue(mockRoadmap);

      const result = await repository.create(dto, slug);

      expect(prismaServiceMock.roadmap.create).toHaveBeenCalledWith({
        data: { name: dto.name, description: undefined, slug, organizationId: dto.organizationId },
      });
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should find and return a roadmap with columns and items', async () => {
      const roadmapId = 'roadmap-id-1';
      const mockRoadmap = {
        id: roadmapId,
        name: 'My Roadmap',
        description: 'A description',
        slug: 'my-roadmap',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [
          {
            id: 'column-id-1',
            name: 'To Do',
            color: '#ff0000',
            order: 1,
            roadmapId,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            items: [
              {
                id: 'item-id-1',
                postId: 'post-id-1',
                columnId: 'column-id-1',
                order: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                post: {
                  id: 'post-id-1',
                  title: 'Post 1',
                  author: { id: 'user-id-1', name: 'John Doe' },
                  _count: { votes: 5, comments: 3 },
                },
              },
            ],
          },
        ],
      };

      prismaServiceMock.roadmap.findUnique.mockResolvedValue(mockRoadmap);

      const result = await repository.findOne(roadmapId);

      expect(prismaServiceMock.roadmap.findUnique).toHaveBeenCalledWith({
        where: { id: roadmapId, deletedAt: null },
        include: {
          columns: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            include: {
              items: {
                orderBy: { order: 'asc' },
                include: {
                  post: {
                    select: {
                      id: true,
                      title: true,
                      author: { select: { id: true, name: true } },
                      _count: { select: { votes: true, comments: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockRoadmap);
    });

    it('should return null if roadmap is not found', async () => {
      const roadmapId = 'non-existent-id';

      prismaServiceMock.roadmap.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(roadmapId);

      expect(result).toBeNull();
    });
  });

  describe('findOneBySlug', () => {
    it('should find and return a roadmap by slug', async () => {
      const slug = 'my-roadmap';
      const mockRoadmap = {
        id: 'roadmap-id-1',
        name: 'My Roadmap',
        description: null,
        slug,
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [],
      };

      prismaServiceMock.roadmap.findUnique.mockResolvedValue(mockRoadmap);

      const result = await repository.findOneBySlug(slug);

      expect(prismaServiceMock.roadmap.findUnique).toHaveBeenCalledWith({
        where: { slug, deletedAt: null },
        include: {
          columns: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            include: {
              items: {
                orderBy: { order: 'asc' },
                include: {
                  post: {
                    select: {
                      id: true,
                      title: true,
                      author: { select: { id: true, name: true } },
                      _count: { select: { votes: true, comments: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockRoadmap);
    });

    it('should return null if slug is not found', async () => {
      prismaServiceMock.roadmap.findUnique.mockResolvedValue(null);

      const result = await repository.findOneBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should find and return all roadmaps for an organization', async () => {
      const organizationId = 'org-id-1';
      const mockRoadmaps = [
        {
          id: 'roadmap-id-1',
          name: 'Roadmap 1',
          description: null,
          slug: 'roadmap-1',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          columns: [],
        },
        {
          id: 'roadmap-id-2',
          name: 'Roadmap 2',
          description: null,
          slug: 'roadmap-2',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          columns: [],
        },
      ];

      prismaServiceMock.roadmap.findMany.mockResolvedValue(mockRoadmaps);

      const result = await repository.findAllByOrganization(organizationId);

      expect(prismaServiceMock.roadmap.findMany).toHaveBeenCalledWith({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          columns: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            include: {
              items: {
                orderBy: { order: 'asc' },
                include: {
                  post: {
                    select: {
                      id: true,
                      title: true,
                      author: { select: { id: true, name: true } },
                      _count: { select: { votes: true, comments: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockRoadmaps);
    });

    it('should return an empty array if no roadmaps found', async () => {
      prismaServiceMock.roadmap.findMany.mockResolvedValue([]);

      const result = await repository.findAllByOrganization('org-id-1');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a roadmap and return the updated record', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: UpdateRoadmapDto = { name: 'Updated Name', description: 'Updated description' };
      const mockUpdated = {
        id: roadmapId,
        name: 'Updated Name',
        description: 'Updated description',
        slug: 'updated-name',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.roadmap.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(roadmapId, dto);

      expect(prismaServiceMock.roadmap.update).toHaveBeenCalledWith({
        where: { id: roadmapId },
        data: { ...dto },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a roadmap by setting deletedAt', async () => {
      const roadmapId = 'roadmap-id-1';

      prismaServiceMock.roadmap.update.mockResolvedValue({} as any);

      await repository.softDelete(roadmapId);

      expect(prismaServiceMock.roadmap.update).toHaveBeenCalledWith({
        where: { id: roadmapId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('addColumn', () => {
    it('should create a column and return its id', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: CreateRoadmapColumnDto = { name: 'To Do', color: '#ff0000' };
      const expectedId = 'column-id-1';
      const mockColumn = {
        id: expectedId,
        name: dto.name,
        color: dto.color,
        order: 0,
        roadmapId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.roadmapColumn.create.mockResolvedValue(mockColumn);

      const result = await repository.addColumn(roadmapId, dto);

      expect(prismaServiceMock.roadmapColumn.create).toHaveBeenCalledWith({
        data: { roadmapId, ...dto },
      });
      expect(result).toBe(expectedId);
    });

    it('should create a column with order', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: CreateRoadmapColumnDto = { name: 'In Progress', color: '#00ff00', order: 2 };
      const expectedId = 'column-id-2';
      const mockColumn = {
        id: expectedId,
        name: dto.name,
        color: dto.color,
        order: 2,
        roadmapId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.roadmapColumn.create.mockResolvedValue(mockColumn);

      const result = await repository.addColumn(roadmapId, dto);

      expect(prismaServiceMock.roadmapColumn.create).toHaveBeenCalledWith({
        data: { roadmapId, ...dto },
      });
      expect(result).toBe(expectedId);
    });
  });

  describe('findColumn', () => {
    it('should find and return a column', async () => {
      const columnId = 'column-id-1';
      const mockColumn = {
        id: columnId,
        name: 'To Do',
        color: '#ff0000',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.roadmapColumn.findUnique.mockResolvedValue(mockColumn);

      const result = await repository.findColumn(columnId);

      expect(prismaServiceMock.roadmapColumn.findUnique).toHaveBeenCalledWith({
        where: { id: columnId, deletedAt: null },
      });
      expect(result).toEqual(mockColumn);
    });

    it('should return null if column is not found', async () => {
      prismaServiceMock.roadmapColumn.findUnique.mockResolvedValue(null);

      const result = await repository.findColumn('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateColumn', () => {
    it('should update a column and return the updated record', async () => {
      const columnId = 'column-id-1';
      const dto: UpdateRoadmapColumnDto = { name: 'Done', color: '#0000ff' };
      const mockUpdated = {
        id: columnId,
        name: 'Done',
        color: '#0000ff',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.roadmapColumn.update.mockResolvedValue(mockUpdated);

      const result = await repository.updateColumn(columnId, dto);

      expect(prismaServiceMock.roadmapColumn.update).toHaveBeenCalledWith({
        where: { id: columnId },
        data: { ...dto },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteColumn', () => {
    it('should soft delete a column by setting deletedAt', async () => {
      const columnId = 'column-id-1';

      prismaServiceMock.roadmapColumn.update.mockResolvedValue({} as any);

      await repository.deleteColumn(columnId);

      expect(prismaServiceMock.roadmapColumn.update).toHaveBeenCalledWith({
        where: { id: columnId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('reorderColumns', () => {
    it('should reorder columns using a transaction', async () => {
      const dto: ReorderRoadmapColumnsDto = {
        columns: [
          { id: 'column-id-1', order: 2 },
          { id: 'column-id-2', order: 1 },
        ],
      };

      prismaServiceMock.$transaction.mockResolvedValue([{} as any, {} as any]);

      await repository.reorderColumns(dto);

      expect(prismaServiceMock.$transaction).toHaveBeenCalledWith([
        prismaServiceMock.roadmapColumn.update({
          where: { id: 'column-id-1' },
          data: { order: 2 },
        }),
        prismaServiceMock.roadmapColumn.update({
          where: { id: 'column-id-2' },
          data: { order: 1 },
        }),
      ]);
    });
  });

  describe('addPostToColumn', () => {
    it('should add a post to a column and return the item id', async () => {
      const columnId = 'column-id-1';
      const dto: AddPostToRoadmapDto = { postId: 'post-id-1' };
      const expectedId = 'item-id-1';
      const mockItem = {
        id: expectedId,
        postId: dto.postId,
        columnId,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaServiceMock.roadmapItem.create.mockResolvedValue(mockItem);

      const result = await repository.addPostToColumn(dto, columnId);

      expect(prismaServiceMock.roadmapItem.create).toHaveBeenCalledWith({
        data: { postId: dto.postId, columnId, order: 0 },
      });
      expect(result).toBe(expectedId);
    });

    it('should add a post with a custom order', async () => {
      const columnId = 'column-id-1';
      const dto: AddPostToRoadmapDto = { postId: 'post-id-2', order: 3 };
      const expectedId = 'item-id-2';
      const mockItem = {
        id: expectedId,
        postId: dto.postId,
        columnId,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaServiceMock.roadmapItem.create.mockResolvedValue(mockItem);

      const result = await repository.addPostToColumn(dto, columnId);

      expect(prismaServiceMock.roadmapItem.create).toHaveBeenCalledWith({
        data: { postId: dto.postId, columnId, order: 3 },
      });
      expect(result).toBe(expectedId);
    });
  });

  describe('removePostFromColumn', () => {
    it('should delete a roadmap item by postId', async () => {
      const postId = 'post-id-1';

      prismaServiceMock.roadmapItem.delete.mockResolvedValue({} as any);

      await repository.removePostFromColumn(postId);

      expect(prismaServiceMock.roadmapItem.delete).toHaveBeenCalledWith({
        where: { postId },
      });
    });
  });

  describe('findItemByPostId', () => {
    it('should find and return an item by postId', async () => {
      const postId = 'post-id-1';
      const mockItem = {
        id: 'item-id-1',
        postId,
        columnId: 'column-id-1',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaServiceMock.roadmapItem.findUnique.mockResolvedValue(mockItem);

      const result = await repository.findItemByPostId(postId);

      expect(prismaServiceMock.roadmapItem.findUnique).toHaveBeenCalledWith({
        where: { postId },
      });
      expect(result).toEqual(mockItem);
    });

    it('should return null if no item found for the post', async () => {
      prismaServiceMock.roadmapItem.findUnique.mockResolvedValue(null);

      const result = await repository.findItemByPostId('non-existent-post');

      expect(result).toBeNull();
    });
  });

  describe('findItemById', () => {
    it('should find and return an item by id with column and roadmap', async () => {
      const itemId = 'item-id-1';
      const mockItem = {
        id: itemId,
        postId: 'post-id-1',
        columnId: 'column-id-1',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        column: {
          id: 'column-id-1',
          name: 'To Do',
          roadmap: { organizationId: 'org-id-1' },
        },
      };

      prismaServiceMock.roadmapItem.findUnique.mockResolvedValue(mockItem);

      const result = await repository.findItemById(itemId);

      expect(prismaServiceMock.roadmapItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: {
          column: {
            include: {
              roadmap: {
                select: { organizationId: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockItem);
    });

    it('should return null if item is not found', async () => {
      prismaServiceMock.roadmapItem.findUnique.mockResolvedValue(null);

      const result = await repository.findItemById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('reorderItems', () => {
    it('should reorder items using a transaction', async () => {
      const items: ReorderRoadmapItemsDto['items'] = [
        { id: 'item-id-1', order: 2 },
        { id: 'item-id-2', order: 1 },
      ];

      prismaServiceMock.$transaction.mockResolvedValue([{} as any, {} as any]);

      await repository.reorderItems(items);

      expect(prismaServiceMock.$transaction).toHaveBeenCalledWith([
        prismaServiceMock.roadmapItem.update({
          where: { id: 'item-id-1' },
          data: { order: 2 },
        }),
        prismaServiceMock.roadmapItem.update({
          where: { id: 'item-id-2' },
          data: { order: 1 },
        }),
      ]);
    });
  });

  describe('findItemsByColumn', () => {
    it('should find and return all items in a column', async () => {
      const columnId = 'column-id-1';
      const mockItems = [
        { id: 'item-id-1', postId: 'post-id-1', columnId, order: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 'item-id-2', postId: 'post-id-2', columnId, order: 2, createdAt: new Date(), updatedAt: new Date() },
      ];

      prismaServiceMock.roadmapItem.findMany.mockResolvedValue(mockItems);

      const result = await repository.findItemsByColumn(columnId);

      expect(prismaServiceMock.roadmapItem.findMany).toHaveBeenCalledWith({
        where: { columnId },
      });
      expect(result).toEqual(mockItems);
    });

    it('should return empty array if no items in column', async () => {
      prismaServiceMock.roadmapItem.findMany.mockResolvedValue([]);

      const result = await repository.findItemsByColumn('column-id-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOrganizationByRoadmapId', () => {
    it('should return the organizationId for a roadmap', async () => {
      const roadmapId = 'roadmap-id-1';
      const mockRoadmap = { organizationId: 'org-id-1' } as any;

      prismaServiceMock.roadmap.findUnique.mockResolvedValue(mockRoadmap);

      const result = await repository.findOrganizationByRoadmapId(roadmapId);

      expect(prismaServiceMock.roadmap.findUnique).toHaveBeenCalledWith({
        where: { id: roadmapId },
        select: { organizationId: true },
      });
      expect(result).toBe('org-id-1');
    });

    it('should return null if roadmap is not found', async () => {
      prismaServiceMock.roadmap.findUnique.mockResolvedValue(null);

      const result = await repository.findOrganizationByRoadmapId('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
