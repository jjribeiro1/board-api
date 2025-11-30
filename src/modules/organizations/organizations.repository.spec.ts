import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsRepository } from './organizations.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'generated/prisma/client';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListPostsQueryDto } from './dto/list-post-query.dto';

describe('OrganizationsRepository', () => {
  let repository: OrganizationsRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<OrganizationsRepository>(OrganizationsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create an organization with owner member and return the organization id', async () => {
      const dto: CreateOrganizationDto = {
        name: 'My Organization',
        logoUrl: 'https://example.com/logo.png',
      };
      const slug = 'my-organization';
      const userId = 'user-id-1';
      const expectedOrgId = 'org-id-1';
      const mockOrganization = {
        id: expectedOrgId,
        name: dto.name,
        slug: slug,
        logoUrl: dto.logoUrl,
        defaultStatusId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.organization.create.mockResolvedValue(mockOrganization);

      const result = await repository.create(dto, slug, userId);

      expect(prismaServiceMock.organization.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          slug: slug,
          logoUrl: dto.logoUrl,
          members: {
            create: {
              role: 'OWNER',
              name: dto.name,
              userId,
            },
          },
        },
      });

      expect(result).toBe(expectedOrgId);
    });
  });

  describe('findOne', () => {
    it('should find and return an organization with related data', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
        name: 'My Organization',
        slug: 'my-organization',
        logoUrl: 'https://example.com/logo.png',
        defaultStatusId: 'status-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        members: [
          {
            id: 'member-id-1',
            userId: 'user-id-1',
            organizationId: organizationId,
            name: 'My Organization',
            role: 'OWNER' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
        organizationCustomStatus: [
          { id: 'status-id-1', name: 'Open', color: '#FF5733' },
          { id: 'status-id-2', name: 'Closed', color: '#28B463' },
        ],
        organizationCustomTags: [
          { id: 'tag-id-1', name: 'Bug', color: '#FF0000' },
          { id: 'tag-id-2', name: 'Feature', color: '#00FF00' },
        ],
      };

      prismaServiceMock.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await repository.findOne(organizationId);

      expect(prismaServiceMock.organization.findUnique).toHaveBeenCalledWith({
        where: { id: organizationId, deletedAt: null },
        include: {
          members: true,
          organizationCustomStatus: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          organizationCustomTags: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      expect(result).toEqual(mockOrganization);
    });

    it('should return null if organization is not found', async () => {
      const organizationId = 'non-existent-org-id';

      prismaServiceMock.organization.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(organizationId);

      expect(result).toBeNull();
    });
  });

  describe('findBoardsFromOrganization', () => {
    it('should find and return boards with post counts', async () => {
      const organizationId = 'org-id-1';
      const mockBoards = [
        {
          id: 'board-id-1',
          title: 'Feature Requests',
          description: 'Suggest new features',
          isPrivate: false,
          isLocked: false,
          organizationId: organizationId,
          authorId: 'user-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          _count: {
            posts: 5,
          },
        },
        {
          id: 'board-id-2',
          title: 'Bug Reports',
          description: 'Report bugs',
          isPrivate: false,
          isLocked: false,
          organizationId: organizationId,
          authorId: 'user-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          _count: {
            posts: 3,
          },
        },
      ];

      prismaServiceMock.board.findMany.mockResolvedValue(mockBoards);

      const result = await repository.findBoardsFromOrganization(organizationId);

      expect(prismaServiceMock.board.findMany).toHaveBeenCalledWith({
        where: {
          organizationId,
          deletedAt: null,
        },
        select: expect.objectContaining({
          id: true,
          title: true,
          description: true,
          isPrivate: true,
          isLocked: true,
        }),
      });

      expect(result).toEqual(mockBoards);
    });

    it('should return an empty array if organization has no boards', async () => {
      const organizationId = 'org-id-1';

      prismaServiceMock.board.findMany.mockResolvedValue([]);

      const result = await repository.findBoardsFromOrganization(organizationId);

      expect(result).toEqual([]);
    });
  });

  describe('findPostsFromOrganization', () => {
    it('should find and return posts with transformed tags', async () => {
      const organizationId = 'org-id-1';
      const filters: ListPostsQueryDto = {
        status: 'status-id-1',
        board: 'board-id-1',
      };
      const mockPosts = [
        {
          id: 'post-id-1',
          title: 'Feature Request',
          isPinned: true,
          description: 'Description',
          isPrivate: false,
          isLocked: false,
          authorId: 'user-id-1',
          boardId: 'board-id-1',
          statusId: 'status-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          board: {
            id: 'board-id-1',
            title: 'Feature Requests',
          },
          status: {
            id: 'status-id-1',
            name: 'Open',
            color: '#FF5733',
          },
          tags: [
            { tag: { id: 'tag-id-1', name: 'Feature', color: '#00FF00' } },
            { tag: { id: 'tag-id-2', name: 'High Priority', color: '#FF0000' } },
          ],
          author: {
            id: 'user-id-1',
            name: 'John Doe',
          },
          _count: {
            comments: 3,
            votes: 5,
          },
        },
        {
          id: 'post-id-2',
          title: 'Another Request',
          isPinned: false,
          description: 'Description 2',
          isPrivate: false,
          isLocked: false,
          authorId: 'user-id-2',
          boardId: 'board-id-1',
          statusId: 'status-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          board: {
            id: 'board-id-1',
            title: 'Feature Requests',
          },
          status: {
            id: 'status-id-1',
            name: 'Open',
            color: '#FF5733',
          },
          tags: [{ tag: { id: 'tag-id-3', name: 'Bug', color: '#FF0000' } }],
          author: {
            id: 'user-id-2',
            name: 'Jane Smith',
          },
          _count: {
            comments: 1,
            votes: 2,
          },
        },
      ];

      prismaServiceMock.post.findMany.mockResolvedValue(mockPosts);

      const result = await repository.findPostsFromOrganization(organizationId, filters);

      expect(prismaServiceMock.post.findMany).toHaveBeenCalledWith({
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        where: {
          deletedAt: null,
          statusId: filters.status,
          board: {
            id: filters.board,
            organizationId: organizationId,
            deletedAt: null,
          },
        },
        select: expect.any(Object),
      });

      expect(result[0].tags).toEqual([
        { id: 'tag-id-1', name: 'Feature', color: '#00FF00' },
        { id: 'tag-id-2', name: 'High Priority', color: '#FF0000' },
      ]);
      expect(result[1].tags).toEqual([{ id: 'tag-id-3', name: 'Bug', color: '#FF0000' }]);
    });

    it('should return an empty array if no posts match filters', async () => {
      const organizationId = 'org-id-1';
      const filters: ListPostsQueryDto = {
        status: 'status-id-1',
        board: 'board-id-1',
      };

      prismaServiceMock.post.findMany.mockResolvedValue([]);

      const result = await repository.findPostsFromOrganization(organizationId, filters);

      expect(result).toEqual([]);
    });
  });

  describe('findMembersFromOrganization', () => {
    it('should find and return members ordered by creation date', async () => {
      const organizationId = 'org-id-1';
      const mockMembers = [
        {
          id: 'member-id-1',
          userId: 'user-id-1',
          organizationId: organizationId,
          name: 'My Organization',
          role: 'OWNER' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          deletedAt: null,
          user: {
            id: 'user-id-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          id: 'member-id-2',
          userId: 'user-id-2',
          organizationId: organizationId,
          name: 'My Organization',
          role: 'MEMBER' as const,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date(),
          deletedAt: null,
          user: {
            id: 'user-id-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      ];

      prismaServiceMock.userOrganization.findMany.mockResolvedValue(mockMembers);

      const result = await repository.findMembersFromOrganization(organizationId);

      expect(prismaServiceMock.userOrganization.findMany).toHaveBeenCalledWith({
        where: {
          organizationId,
          deletedAt: null,
        },
        select: {
          id: true,
          userId: true,
          name: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      expect(result).toEqual(mockMembers);
    });

    it('should return an empty array if organization has no members', async () => {
      const organizationId = 'org-id-1';

      prismaServiceMock.userOrganization.findMany.mockResolvedValue([]);

      const result = await repository.findMembersFromOrganization(organizationId);

      expect(result).toEqual([]);
    });
  });

  describe('findTagsFromOrganization', () => {
    it('should find and return tags ordered by creation date desc', async () => {
      const organizationId = 'org-id-1';
      const mockTags = [
        {
          id: 'tag-id-1',
          name: 'Feature',
          color: '#00FF00',
          organizationId: organizationId,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'tag-id-2',
          name: 'Bug',
          color: '#FF0000',
          organizationId: organizationId,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      prismaServiceMock.tag.findMany.mockResolvedValue(mockTags);

      const result = await repository.findTagsFromOrganization(organizationId);

      expect(prismaServiceMock.tag.findMany).toHaveBeenCalledWith({
        where: {
          organizationId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(mockTags);
    });

    it('should return an empty array if organization has no tags', async () => {
      const organizationId = 'org-id-1';

      prismaServiceMock.tag.findMany.mockResolvedValue([]);

      const result = await repository.findTagsFromOrganization(organizationId);

      expect(result).toEqual([]);
    });
  });

  describe('findStatusFromOrganization', () => {
    it('should find and return status ordered by creation date desc', async () => {
      const organizationId = 'org-id-1';
      const mockStatuses = [
        {
          id: 'status-id-1',
          name: 'Open',
          color: '#FF5733',
          organizationId: organizationId,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'status-id-2',
          name: 'Closed',
          color: '#28B463',
          organizationId: organizationId,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      prismaServiceMock.status.findMany.mockResolvedValue(mockStatuses);

      const result = await repository.findStatusFromOrganization(organizationId);

      expect(prismaServiceMock.status.findMany).toHaveBeenCalledWith({
        where: {
          organizationId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(mockStatuses);
    });

    it('should return an empty array if organization has no status', async () => {
      const organizationId = 'org-id-1';

      prismaServiceMock.status.findMany.mockResolvedValue([]);

      const result = await repository.findStatusFromOrganization(organizationId);

      expect(result).toEqual([]);
    });
  });

  describe('setDefaultStatus', () => {
    it('should update the default status of an organization', async () => {
      const organizationId = 'org-id-1';
      const statusId = 'status-id-1';
      const mockUpdatedOrganization = {
        id: organizationId,
        name: 'My Organization',
        slug: 'my-organization',
        logoUrl: null,
        defaultStatusId: statusId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.organization.update.mockResolvedValue(mockUpdatedOrganization);

      await repository.setDefaultStatus(organizationId, statusId);

      expect(prismaServiceMock.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: { defaultStatusId: statusId },
      });
    });
  });
});
