import { Test, TestingModule } from '@nestjs/testing';
import { TagsRepository } from './tags.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

describe('TagsRepository', () => {
  let repository: TagsRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<TagsRepository>(TagsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a tag and return the tag id', async () => {
      const dto: CreateTagDto = {
        name: 'Feature',
        color: '#FF5733',
        organizationId: 'org-id-1',
      };
      const expectedTagId = 'tag-id-1';
      const mockTag = {
        id: expectedTagId,
        name: dto.name,
        color: dto.color,
        organizationId: dto.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.tag.create.mockResolvedValue(mockTag);

      const result = await repository.create(dto);

      expect(prismaServiceMock.tag.create).toHaveBeenCalledWith({
        data: {
          ...dto,
        },
      });

      expect(result).toBe(expectedTagId);
    });
  });

  describe('createMany', () => {
    it('should create multiple tags', async () => {
      const dtos: CreateTagDto[] = [
        {
          name: 'Bug',
          color: '#FF0000',
          organizationId: 'org-id-1',
        },
        {
          name: 'Enhancement',
          color: '#00FF00',
          organizationId: 'org-id-1',
        },
      ];

      prismaServiceMock.tag.createMany.mockResolvedValue({ count: 2 });

      await repository.createMany(dtos);

      expect(prismaServiceMock.tag.createMany).toHaveBeenCalledWith({
        data: dtos,
      });
    });
  });

  describe('findOne', () => {
    it('should find and return a tag by id', async () => {
      const tagId = 'tag-id-1';
      const mockTag = {
        id: tagId,
        name: 'Feature',
        color: '#FF5733',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.tag.findUnique.mockResolvedValue(mockTag);

      const result = await repository.findOne(tagId);

      expect(prismaServiceMock.tag.findUnique).toHaveBeenCalledWith({
        where: {
          id: tagId,
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockTag);
    });

    it('should return null if tag is not found', async () => {
      const tagId = 'non-existent-tag-id';

      prismaServiceMock.tag.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(tagId);

      expect(prismaServiceMock.tag.findUnique).toHaveBeenCalledWith({
        where: {
          id: tagId,
          deletedAt: null,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a tag and return the updated tag', async () => {
      const tagId = 'tag-id-1';
      const dto: UpdateTagDto = {
        name: 'Updated Feature',
        color: '#00FFFF',
      };
      const mockUpdatedTag = {
        id: tagId,
        name: 'Updated Feature',
        color: '#00FFFF',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.tag.update.mockResolvedValue(mockUpdatedTag);

      const result = await repository.update(tagId, dto);

      expect(prismaServiceMock.tag.update).toHaveBeenCalledWith({
        where: { id: tagId },
        data: {
          ...dto,
        },
      });

      expect(result).toEqual(mockUpdatedTag);
    });
  });

  describe('delete', () => {
    it('should soft delete a tag by setting deletedAt', async () => {
      const tagId = 'tag-id-1';
      const mockDeletedTag = {
        id: tagId,
        name: 'Feature',
        color: '#FF5733',
        organizationId: 'org-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      prismaServiceMock.tag.update.mockResolvedValue(mockDeletedTag);

      await repository.delete(tagId);

      expect(prismaServiceMock.tag.update).toHaveBeenCalledWith({
        where: { id: tagId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
