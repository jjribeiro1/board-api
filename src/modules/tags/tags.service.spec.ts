import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { TagsService } from './tags.service';
import { TagsRepository } from './tags.repository';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let tagsService: TagsService;
  let tagsRepositoryMock: DeepMockProxy<TagsRepository>;

  beforeEach(async () => {
    tagsRepositoryMock = mockDeep<TagsRepository>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: TagsRepository,
          useValue: tagsRepositoryMock,
        },
      ],
    }).compile();

    tagsService = moduleRef.get<TagsService>(TagsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new tag and return the ID', async () => {
      const dto: CreateTagDto = {
        name: 'Frontend',
        color: '#FF5733',
        organizationId: 'org-id-1',
      };
      const expectedId = 'tag-id-1';

      tagsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await tagsService.create(dto);

      expect(result).toBe(expectedId);
      expect(tagsRepositoryMock.create).toHaveBeenCalledWith(dto);
      expect(tagsRepositoryMock.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('createDefaultTagsForOrg', () => {
    it('should create default tags for an organization', async () => {
      const organizationId = 'org-id-1';
      const tags = [
        { name: 'Baixa prioridade', color: '#008000' },
        { name: 'Alta prioridade', color: '#FF0000' },
      ];
      tagsRepositoryMock.createMany.mockResolvedValue(undefined);

      await tagsService.createDefaultTagsForOrg(organizationId);

      expect(tagsRepositoryMock.createMany).toHaveBeenCalledWith(
        tags.map((tag) => ({
          ...tag,
          organizationId,
        })),
      );
      expect(tagsRepositoryMock.createMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const tagId = 'tag-id-1';
    const mockTag = {
      id: tagId,
      name: 'Frontend',
      color: '#FF5733',
      organizationId: 'org-id-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    it('should return a tag when found', async () => {
      tagsRepositoryMock.findOne.mockResolvedValue(mockTag);

      const result = await tagsService.findOne(tagId);

      expect(result).toEqual(mockTag);
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledWith(tagId);
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when tag is not found', async () => {
      tagsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `Tag com id: ${tagId} não encontrada`;

      await expect(tagsService.findOne(tagId)).rejects.toThrow(new NotFoundException(errorMessage));
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledWith(tagId);
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const tagId = 'tag-id-1';
    const mockTag = {
      id: tagId,
      name: 'Frontend',
      color: '#FF5733',
      organizationId: 'org-id-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should update a tag successfully', async () => {
      const updateDto: UpdateTagDto = {
        name: 'Backend',
        color: '#0000FF',
      };

      const updatedTag = {
        ...mockTag,
        ...updateDto,
      };

      tagsRepositoryMock.findOne.mockResolvedValue(mockTag);
      tagsRepositoryMock.update.mockResolvedValue(updatedTag);

      const result = await tagsService.update(tagId, updateDto);

      expect(result).toEqual(updatedTag);
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledWith(tagId);
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(tagsRepositoryMock.update).toHaveBeenCalledWith(tagId, updateDto);
      expect(tagsRepositoryMock.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when trying to update non-existent tag', async () => {
      const updateDto: UpdateTagDto = {
        name: 'Backend',
      };

      tagsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `Tag com id: ${tagId} não encontrada`;

      await expect(tagsService.update(tagId, updateDto)).rejects.toThrow(new NotFoundException(errorMessage));
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledWith(tagId);
      expect(tagsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(tagsRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('should allow partial updates', async () => {
      const updateDto: UpdateTagDto = {
        color: '#00FF00',
      };

      const updatedTag = {
        ...mockTag,
        color: '#00FF00',
      };

      tagsRepositoryMock.findOne.mockResolvedValue(mockTag);
      tagsRepositoryMock.update.mockResolvedValue(updatedTag);

      const result = await tagsService.update(tagId, updateDto);

      expect(result).toEqual(updatedTag);
      expect(tagsRepositoryMock.update).toHaveBeenCalledWith(tagId, updateDto);
    });
  });

  describe('remove', () => {
    const tagId = 'tag-id-1';

    it('should delete a tag successfully', async () => {
      tagsRepositoryMock.delete.mockResolvedValue(undefined);

      await tagsService.remove(tagId);

      expect(tagsRepositoryMock.delete).toHaveBeenCalledWith(tagId);
      expect(tagsRepositoryMock.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors during deletion', async () => {
      const error = new Error('Database error');

      tagsRepositoryMock.delete.mockRejectedValue(error);

      await expect(tagsService.remove(tagId)).rejects.toThrow('Database error');
      expect(tagsRepositoryMock.delete).toHaveBeenCalledWith(tagId);
      expect(tagsRepositoryMock.delete).toHaveBeenCalledTimes(1);
    });
  });
});
