import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

describe('TagsController', () => {
  let controller: TagsController;
  let tagsServiceMock: DeepMockProxy<TagsService>;

  beforeEach(async () => {
    tagsServiceMock = mockDeep<TagsService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: tagsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
  });

  describe('create', () => {
    it('should create a new tag and returns its ID', async () => {
      const dto: CreateTagDto = {
        color: '#FF5733',
        name: 'Urgente',
        organizationId: 'org-id-1',
      };
      const expectedId = 'tag-id-1';
      tagsServiceMock.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto);

      expect(result).toBe(expectedId);
      expect(tagsServiceMock.create).toHaveBeenCalledWith(dto);
      expect(tagsServiceMock.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a tag wrapped in data property', async () => {
      const tagId = 'tag-id-1';
      const mockTag = {
        id: tagId,
        name: 'Urgente',
        color: '#FF5733',
        organizationId: 'org-id-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      };

      tagsServiceMock.findOne.mockResolvedValue(mockTag);

      const result = await controller.findOne(tagId);

      expect(result).toEqual({ data: mockTag });
      expect(tagsServiceMock.findOne).toHaveBeenCalledWith(tagId);
      expect(tagsServiceMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a tag and return it wrapped in data property', async () => {
      const tagId = 'tag-id-1';
      const updateDto: UpdateTagDto = {
        name: 'Alta Prioridade',
        color: '#0000FF',
      };
      const updatedTag = {
        id: tagId,
        name: 'Alta Prioridade',
        color: '#0000FF',
        organizationId: 'org-id-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      tagsServiceMock.update.mockResolvedValue(updatedTag);

      const result = await controller.update(tagId, updateDto);

      expect(result).toEqual({ data: updatedTag });
      expect(tagsServiceMock.update).toHaveBeenCalledWith(tagId, updateDto);
      expect(tagsServiceMock.update).toHaveBeenCalledTimes(1);
    });

    it('should allow partial updates', async () => {
      const tagId = 'tag-id-1';
      const updateDto: UpdateTagDto = {
        color: '#00FF00',
      };
      const updatedTag = {
        id: tagId,
        name: 'Urgente',
        color: '#00FF00',
        organizationId: 'org-id-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      tagsServiceMock.update.mockResolvedValue(updatedTag);

      const result = await controller.update(tagId, updateDto);

      expect(result).toEqual({ data: updatedTag });
      expect(tagsServiceMock.update).toHaveBeenCalledWith(tagId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a tag successfully', async () => {
      const tagId = 'tag-id-1';

      tagsServiceMock.remove.mockResolvedValue(undefined);

      const result = await controller.remove(tagId);

      expect(result).toBeUndefined();
      expect(tagsServiceMock.remove).toHaveBeenCalledWith(tagId);
      expect(tagsServiceMock.remove).toHaveBeenCalledTimes(1);
    });
  });
});
