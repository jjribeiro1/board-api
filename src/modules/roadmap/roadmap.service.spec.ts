import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { RoadmapRepository } from './roadmap.repository';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { CreateRoadmapColumnDto } from './dto/create-roadmap-column.dto';
import { UpdateRoadmapColumnDto } from './dto/update-roadmap-column.dto';
import { ReorderRoadmapColumnsDto } from './dto/reorder-roadmap-columns.dto';
import { AddPostToRoadmapDto } from './dto/add-post-to-roadmap.dto';
import { ReorderRoadmapItemsDto } from './dto/reorder-roadmap-items.dto';

describe('RoadmapService', () => {
  let service: RoadmapService;
  let roadmapRepositoryMock: DeepMockProxy<RoadmapRepository>;

  beforeEach(async () => {
    roadmapRepositoryMock = mockDeep<RoadmapRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapService,
        {
          provide: RoadmapRepository,
          useValue: roadmapRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<RoadmapService>(RoadmapService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a roadmap and return its ID', async () => {
      const dto: CreateRoadmapDto = {
        name: 'Minha Rota',
        description: 'Descrição',
        organizationId: 'org-id-1',
      };
      const expectedId = 'roadmap-id-1';

      roadmapRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto);

      expect(roadmapRepositoryMock.create).toHaveBeenCalledWith(dto, 'minha-rota');
      expect(roadmapRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should return a roadmap when found', async () => {
      const roadmapId = 'roadmap-id-1';
      const mockRoadmap = {
        id: roadmapId,
        name: 'Minha Rota',
        slug: 'minha-rota',
        description: 'Descrição',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [],
      };

      roadmapRepositoryMock.findOne.mockResolvedValue(mockRoadmap as any);

      const result = await service.findOne(roadmapId);

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRoadmap);
    });

    it('should throw NotFoundException when roadmap is not found', async () => {
      const roadmapId = 'non-existent-id';

      roadmapRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `roadmap com id: ${roadmapId} não encontrado`;

      await expect(service.findOne(roadmapId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneBySlug', () => {
    it('should return a roadmap when slug is found', async () => {
      const slug = 'minha-rota';
      const mockRoadmap = {
        id: 'roadmap-id-1',
        name: 'Minha Rota',
        slug,
        description: 'Descrição',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [],
      };

      roadmapRepositoryMock.findOneBySlug.mockResolvedValue(mockRoadmap as any);

      const result = await service.findOneBySlug(slug);

      expect(roadmapRepositoryMock.findOneBySlug).toHaveBeenCalledWith(slug);
      expect(roadmapRepositoryMock.findOneBySlug).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRoadmap);
    });

    it('should throw NotFoundException when slug is not found', async () => {
      const slug = 'non-existent-slug';

      roadmapRepositoryMock.findOneBySlug.mockResolvedValue(null);

      const errorMessage = `roadmap com slug: ${slug} não encontrado`;

      await expect(service.findOneBySlug(slug)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findOneBySlug).toHaveBeenCalledWith(slug);
      expect(roadmapRepositoryMock.findOneBySlug).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllByOrganization', () => {
    it('should return all roadmaps from an organization', async () => {
      const organizationId = 'org-id-1';
      const mockRoadmaps = [
        {
          id: 'roadmap-id-1',
          name: 'Rota Um',
          slug: 'rota-um',
          organizationId,
          columns: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      roadmapRepositoryMock.findAllByOrganization.mockResolvedValue(mockRoadmaps as any);

      const result = await service.findAllByOrganization(organizationId);

      expect(roadmapRepositoryMock.findAllByOrganization).toHaveBeenCalledWith(organizationId);
      expect(roadmapRepositoryMock.findAllByOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRoadmaps);
    });
  });

  describe('update', () => {
    it('should update a roadmap', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: UpdateRoadmapDto = { name: 'Novo Nome' };
      const mockRoadmap = {
        id: roadmapId,
        name: 'Nome Antigo',
        slug: 'nome-antigo',
        description: 'Descrição',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [],
      };
      const updatedRoadmap = {
        ...mockRoadmap,
        name: 'Novo Nome',
        slug: 'novo-nome',
      };

      roadmapRepositoryMock.findOne.mockResolvedValue(mockRoadmap as any);
      roadmapRepositoryMock.update.mockResolvedValue(updatedRoadmap as any);

      const result = await service.update(roadmapId, dto);

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.update).toHaveBeenCalledWith(roadmapId, { name: 'Novo Nome', slug: 'novo-nome' });
      expect(roadmapRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedRoadmap);
    });

    it('should update a roadmap without changing the name', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: UpdateRoadmapDto = { description: 'Nova descrição' };
      const mockRoadmap = {
        id: roadmapId,
        name: 'Nome',
        slug: 'nome',
        description: 'Descrição antiga',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [],
      };
      const updatedRoadmap = {
        ...mockRoadmap,
        description: 'Nova descrição',
      };

      roadmapRepositoryMock.findOne.mockResolvedValue(mockRoadmap as any);
      roadmapRepositoryMock.update.mockResolvedValue(updatedRoadmap as any);

      const result = await service.update(roadmapId, dto);

      expect(roadmapRepositoryMock.update).toHaveBeenCalledWith(roadmapId, { description: 'Nova descrição' });
      expect(result).toEqual(updatedRoadmap);
    });

    it('should throw NotFoundException when roadmap does not exist', async () => {
      const roadmapId = 'non-existent-id';
      const dto: UpdateRoadmapDto = { name: 'Novo Nome' };

      roadmapRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `roadmap com id: ${roadmapId} não encontrado`;

      await expect(service.update(roadmapId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a roadmap', async () => {
      const roadmapId = 'roadmap-id-1';
      const mockRoadmap = {
        id: roadmapId,
        name: 'Rota',
        slug: 'rota',
        description: 'Descrição',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [],
      };

      roadmapRepositoryMock.findOne.mockResolvedValue(mockRoadmap as any);
      roadmapRepositoryMock.softDelete.mockResolvedValue(undefined);

      await service.remove(roadmapId);

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(roadmapRepositoryMock.softDelete).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when roadmap does not exist', async () => {
      const roadmapId = 'non-existent-id';

      roadmapRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `roadmap com id: ${roadmapId} não encontrado`;

      await expect(service.remove(roadmapId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('addColumn', () => {
    it('should add a column to a roadmap', async () => {
      const roadmapId = 'roadmap-id-1';
      const dto: CreateRoadmapColumnDto = { name: 'Em Progresso', color: '#ff0' };
      const mockRoadmap = {
        id: roadmapId,
        name: 'Rota',
        slug: 'rota',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        columns: [],
      };
      const columnId = 'column-id-1';

      roadmapRepositoryMock.findOne.mockResolvedValue(mockRoadmap as any);
      roadmapRepositoryMock.addColumn.mockResolvedValue(columnId);

      const result = await service.addColumn(roadmapId, dto);

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.addColumn).toHaveBeenCalledWith(roadmapId, dto);
      expect(roadmapRepositoryMock.addColumn).toHaveBeenCalledTimes(1);
      expect(result).toBe(columnId);
    });

    it('should throw NotFoundException when roadmap does not exist', async () => {
      const roadmapId = 'non-existent-id';
      const dto: CreateRoadmapColumnDto = { name: 'Em Progresso', color: '#ff0' };

      roadmapRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `roadmap com id: ${roadmapId} não encontrado`;

      await expect(service.addColumn(roadmapId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findOne).toHaveBeenCalledWith(roadmapId);
      expect(roadmapRepositoryMock.addColumn).not.toHaveBeenCalled();
    });
  });

  describe('findColumn', () => {
    it('should return a column when found', async () => {
      const columnId = 'column-id-1';
      const mockColumn = {
        id: columnId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);

      const result = await service.findColumn(columnId);

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockColumn);
    });

    it('should throw NotFoundException when column is not found', async () => {
      const columnId = 'non-existent-id';

      roadmapRepositoryMock.findColumn.mockResolvedValue(null);

      const errorMessage = `coluna com id: ${columnId} não encontrada`;

      await expect(service.findColumn(columnId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateColumn', () => {
    it('should update a column', async () => {
      const columnId = 'column-id-1';
      const dto: UpdateRoadmapColumnDto = { name: 'Concluído' };
      const mockColumn = {
        id: columnId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const updatedColumn = {
        ...mockColumn,
        name: 'Concluído',
      };

      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);
      roadmapRepositoryMock.updateColumn.mockResolvedValue(updatedColumn);

      const result = await service.updateColumn(columnId, dto);

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.updateColumn).toHaveBeenCalledWith(columnId, dto);
      expect(roadmapRepositoryMock.updateColumn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedColumn);
    });

    it('should throw NotFoundException when column does not exist', async () => {
      const columnId = 'non-existent-id';
      const dto: UpdateRoadmapColumnDto = { name: 'Concluído' };

      roadmapRepositoryMock.findColumn.mockResolvedValue(null);

      const errorMessage = `coluna com id: ${columnId} não encontrada`;

      await expect(service.updateColumn(columnId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.updateColumn).not.toHaveBeenCalled();
    });
  });

  describe('deleteColumn', () => {
    it('should delete a column', async () => {
      const columnId = 'column-id-1';
      const mockColumn = {
        id: columnId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);
      roadmapRepositoryMock.deleteColumn.mockResolvedValue(undefined);

      await service.deleteColumn(columnId);

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledTimes(1);
      expect(roadmapRepositoryMock.deleteColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.deleteColumn).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when column does not exist', async () => {
      const columnId = 'non-existent-id';

      roadmapRepositoryMock.findColumn.mockResolvedValue(null);

      const errorMessage = `coluna com id: ${columnId} não encontrada`;

      await expect(service.deleteColumn(columnId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.deleteColumn).not.toHaveBeenCalled();
    });
  });

  describe('reorderColumns', () => {
    it('should reorder columns', async () => {
      const dto: ReorderRoadmapColumnsDto = {
        columns: [
          { id: 'col-1', order: 1 },
          { id: 'col-2', order: 2 },
        ],
      };

      await service.reorderColumns(dto);

      expect(roadmapRepositoryMock.reorderColumns).toHaveBeenCalledWith(dto);
      expect(roadmapRepositoryMock.reorderColumns).toHaveBeenCalledTimes(1);
    });
  });

  describe('addPostToColumn', () => {
    it('should add a post to a column', async () => {
      const columnId = 'column-id-1';
      const dto: AddPostToRoadmapDto = { postId: 'post-id-1', order: 1 };
      const mockColumn = {
        id: columnId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const itemId = 'item-id-1';

      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);
      roadmapRepositoryMock.findItemByPostId.mockResolvedValue(null);
      roadmapRepositoryMock.addPostToColumn.mockResolvedValue(itemId);

      const result = await service.addPostToColumn(columnId, dto);

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findItemByPostId).toHaveBeenCalledWith(dto.postId);
      expect(roadmapRepositoryMock.addPostToColumn).toHaveBeenCalledWith(dto, columnId);
      expect(roadmapRepositoryMock.addPostToColumn).toHaveBeenCalledTimes(1);
      expect(result).toBe(itemId);
    });

    it('should throw ConflictException when post already exists in a column', async () => {
      const columnId = 'column-id-1';
      const dto: AddPostToRoadmapDto = { postId: 'post-id-1' };
      const mockColumn = {
        id: columnId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const existingItem = {
        id: 'item-id-1',
        postId: 'post-id-1',
        columnId: 'other-column',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);
      roadmapRepositoryMock.findItemByPostId.mockResolvedValue(existingItem);

      await expect(service.addPostToColumn(columnId, dto)).rejects.toThrow(
        new ConflictException('este post já está em uma coluna do roadmap'),
      );

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findItemByPostId).toHaveBeenCalledWith(dto.postId);
      expect(roadmapRepositoryMock.addPostToColumn).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when column does not exist', async () => {
      const columnId = 'non-existent-id';
      const dto: AddPostToRoadmapDto = { postId: 'post-id-1' };

      roadmapRepositoryMock.findColumn.mockResolvedValue(null);

      const errorMessage = `coluna com id: ${columnId} não encontrada`;

      await expect(service.addPostToColumn(columnId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findItemByPostId).not.toHaveBeenCalled();
      expect(roadmapRepositoryMock.addPostToColumn).not.toHaveBeenCalled();
    });
  });

  describe('removePostFromColumn', () => {
    it('should remove a post from a column', async () => {
      const postId = 'post-id-1';
      const existingItem = {
        id: 'item-id-1',
        postId,
        columnId: 'column-id-1',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      roadmapRepositoryMock.findItemByPostId.mockResolvedValue(existingItem);
      roadmapRepositoryMock.removePostFromColumn.mockResolvedValue(undefined);

      await service.removePostFromColumn(postId);

      expect(roadmapRepositoryMock.findItemByPostId).toHaveBeenCalledWith(postId);
      expect(roadmapRepositoryMock.findItemByPostId).toHaveBeenCalledTimes(1);
      expect(roadmapRepositoryMock.removePostFromColumn).toHaveBeenCalledWith(postId);
      expect(roadmapRepositoryMock.removePostFromColumn).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when post is not in roadmap', async () => {
      const postId = 'non-existent-post';

      roadmapRepositoryMock.findItemByPostId.mockResolvedValue(null);

      await expect(service.removePostFromColumn(postId)).rejects.toThrow(
        new NotFoundException('post não encontrado no roadmap'),
      );

      expect(roadmapRepositoryMock.findItemByPostId).toHaveBeenCalledWith(postId);
      expect(roadmapRepositoryMock.removePostFromColumn).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove an item by item ID', async () => {
      const itemId = 'item-id-1';
      const existingItem = {
        id: itemId,
        postId: 'post-id-1',
        columnId: 'column-id-1',
      };

      roadmapRepositoryMock.findItemById.mockResolvedValue(existingItem as any);
      roadmapRepositoryMock.removePostFromColumn.mockResolvedValue(undefined);

      await service.removeItem(itemId);

      expect(roadmapRepositoryMock.findItemById).toHaveBeenCalledWith(itemId);
      expect(roadmapRepositoryMock.findItemById).toHaveBeenCalledTimes(1);
      expect(roadmapRepositoryMock.removePostFromColumn).toHaveBeenCalledWith('post-id-1');
      expect(roadmapRepositoryMock.removePostFromColumn).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      const itemId = 'non-existent-item';

      roadmapRepositoryMock.findItemById.mockResolvedValue(null);

      await expect(service.removeItem(itemId)).rejects.toThrow(new NotFoundException('item do roadmap não encontrado'));

      expect(roadmapRepositoryMock.findItemById).toHaveBeenCalledWith(itemId);
      expect(roadmapRepositoryMock.removePostFromColumn).not.toHaveBeenCalled();
    });
  });

  describe('reorderItems', () => {
    it('should reorder items in a column', async () => {
      const columnId = 'column-id-1';
      const dto: ReorderRoadmapItemsDto = {
        items: [
          { id: 'item-1', order: 1 },
          { id: 'item-2', order: 2 },
        ],
      };
      const mockColumn = {
        id: columnId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const columnItems = [
        { id: 'item-1', postId: 'post-1', columnId, order: 0 },
        { id: 'item-2', postId: 'post-2', columnId, order: 1 },
      ];

      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);
      roadmapRepositoryMock.findItemsByColumn.mockResolvedValue(columnItems as any);

      await service.reorderItems(columnId, dto);

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findItemsByColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.reorderItems).toHaveBeenCalledWith(dto.items);
      expect(roadmapRepositoryMock.reorderItems).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when items do not belong to the column', async () => {
      const columnId = 'column-id-1';
      const dto: ReorderRoadmapItemsDto = {
        items: [
          { id: 'item-1', order: 1 },
          { id: 'item-3', order: 2 },
        ],
      };
      const mockColumn = {
        id: columnId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const columnItems = [
        { id: 'item-1', postId: 'post-1', columnId, order: 0 },
        { id: 'item-2', postId: 'post-2', columnId, order: 1 },
      ];

      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);
      roadmapRepositoryMock.findItemsByColumn.mockResolvedValue(columnItems as any);

      await expect(service.reorderItems(columnId, dto)).rejects.toThrow(
        new BadRequestException('todos os itens devem pertencer à coluna especificada'),
      );

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findItemsByColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.reorderItems).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when column does not exist', async () => {
      const columnId = 'non-existent-id';
      const dto: ReorderRoadmapItemsDto = { items: [{ id: 'item-1', order: 1 }] };

      roadmapRepositoryMock.findColumn.mockResolvedValue(null);

      const errorMessage = `coluna com id: ${columnId} não encontrada`;

      await expect(service.reorderItems(columnId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(columnId);
      expect(roadmapRepositoryMock.findItemsByColumn).not.toHaveBeenCalled();
      expect(roadmapRepositoryMock.reorderItems).not.toHaveBeenCalled();
    });
  });

  describe('findOrgAndAuthorId', () => {
    it('should return org info from an item', async () => {
      const resourceId = 'item-id-1';
      const mockItem = {
        id: resourceId,
        postId: 'post-id-1',
        columnId: 'column-id-1',
        column: {
          roadmap: {
            organizationId: 'org-id-1',
          },
        },
      };

      roadmapRepositoryMock.findItemById.mockResolvedValue(mockItem as any);

      const result = await service.findOrgAndAuthorId(resourceId);

      expect(roadmapRepositoryMock.findItemById).toHaveBeenCalledWith(resourceId);
      expect(roadmapRepositoryMock.findColumn).not.toHaveBeenCalled();
      expect(result).toEqual({ organizationId: 'org-id-1', authorId: null });
    });

    it('should return org info from a column when item is not found', async () => {
      const resourceId = 'column-id-1';
      const mockColumn = {
        id: resourceId,
        name: 'Em Progresso',
        color: '#ff0',
        order: 1,
        roadmapId: 'roadmap-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      roadmapRepositoryMock.findItemById.mockResolvedValue(null);
      roadmapRepositoryMock.findColumn.mockResolvedValue(mockColumn);
      roadmapRepositoryMock.findOrganizationByRoadmapId.mockResolvedValue('org-id-1');

      const result = await service.findOrgAndAuthorId(resourceId);

      expect(roadmapRepositoryMock.findItemById).toHaveBeenCalledWith(resourceId);
      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(resourceId);
      expect(roadmapRepositoryMock.findOrganizationByRoadmapId).toHaveBeenCalledWith('roadmap-id-1');
      expect(result).toEqual({ organizationId: 'org-id-1', authorId: null });
    });

    it('should return null when neither item nor column is found', async () => {
      const resourceId = 'non-existent-id';

      roadmapRepositoryMock.findItemById.mockResolvedValue(null);
      roadmapRepositoryMock.findColumn.mockResolvedValue(null);

      const result = await service.findOrgAndAuthorId(resourceId);

      expect(roadmapRepositoryMock.findItemById).toHaveBeenCalledWith(resourceId);
      expect(roadmapRepositoryMock.findColumn).toHaveBeenCalledWith(resourceId);
      expect(result).toBeNull();
    });
  });
});
