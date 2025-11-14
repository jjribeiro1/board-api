import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListPostsQueryDto } from './dto/list-post-query.dto';
import { UserPayload } from 'src/common/types/user-payload';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let mockOrganizationsService: DeepMockProxy<OrganizationsService>;

  beforeEach(async () => {
    mockOrganizationsService = mockDeep<OrganizationsService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  describe('create', () => {
    it('should create a new organization and return its ID', async () => {
      const expectedId = 'org-id-1';
      const dto: CreateOrganizationDto = {
        name: 'Test Organization',
        logoUrl: null,
      };
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'email@example.com',
        name: 'John Doe',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrganizationsService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto, user);

      expect(mockOrganizationsService.create).toHaveBeenCalledWith(dto, user.id);
      expect(mockOrganizationsService.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should return an organization wrapped in data property', async () => {
      const orgId = 'org-id-1';
      const mockOrganization = {
        id: orgId,
        name: 'Test Organization',
        slug: 'test-organization',
        defaultStatusId: 'default-status-id',
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        members: [],
        organizationCustomStatus: [],
        organizationCustomTags: [],
      };

      mockOrganizationsService.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne(orgId);

      expect(mockOrganizationsService.findOne).toHaveBeenCalledWith(orgId);
      expect(mockOrganizationsService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockOrganization });
    });
  });

  describe('findBoards', () => {
    it('should return all boards from an organization wrapped in data property', async () => {
      const orgId = 'org-id-1';
      const mockBoards = [
        {
          id: 'board-id-1',
          title: 'Feature Requests',
          description: 'Submit your feature ideas',
          isPrivate: false,
          isLocked: false,
          organizationId: orgId,
          authorId: 'user-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          _count: { posts: 5 },
        },
        {
          id: 'board-id-2',
          title: 'Bug Reports',
          description: 'Report bugs here',
          isPrivate: false,
          isLocked: false,
          organizationId: orgId,
          authorId: 'user-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          _count: { posts: 3 },
        },
      ];

      mockOrganizationsService.findBoardsFromOrganization.mockResolvedValue(mockBoards);

      const result = await controller.findBoards(orgId);

      expect(mockOrganizationsService.findBoardsFromOrganization).toHaveBeenCalledWith(orgId);
      expect(mockOrganizationsService.findBoardsFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockBoards });
    });
  });

  describe('findPostsFromOrganization', () => {
    it('should return posts from organization with filters', async () => {
      const orgId = 'org-id-1';
      const query: ListPostsQueryDto = {
        status: 'status-id-1',
        board: 'board-id-1',
      };
      const mockPosts = [
        {
          id: 'post-id-1',
          title: 'First Post',
          description: 'Post description',
          isPinned: false,
          createdAt: new Date(),
          board: {
            id: 'board-id-1',
            title: 'Feature Requests',
          },
          status: {
            id: 'status-id-1',
            name: 'To Do',
            color: '#ff0000',
          },
          tags: [],
          author: {
            id: 'user-id-1',
            name: 'John Doe',
          },
          _count: {
            comments: 2,
            votes: 5,
          },
        },
      ];

      mockOrganizationsService.findPostsFromOrganization.mockResolvedValue(mockPosts);

      const result = await controller.findPostsFromOrganization(orgId, query);

      expect(mockOrganizationsService.findPostsFromOrganization).toHaveBeenCalledWith(orgId, query);
      expect(mockOrganizationsService.findPostsFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockPosts });
    });

    it('should return posts without filters', async () => {
      const orgId = 'org-id-1';
      const query: ListPostsQueryDto = {};
      const mockPosts = [
        {
          id: 'post-id-1',
          title: 'First Post',
          description: 'Post description',
          isPinned: false,
          createdAt: new Date(),
          board: {
            id: 'board-id-1',
            title: 'Feature Requests',
          },
          status: {
            id: 'status-id-1',
            name: 'To Do',
            color: '#ff0000',
          },
          tags: [
            {
              id: 'tag-id-1',
              name: 'Feature',
              color: '#00ff00',
            },
          ],
          author: {
            id: 'user-id-1',
            name: 'John Doe',
          },
          _count: {
            comments: 2,
            votes: 5,
          },
        },
        {
          id: 'post-id-2',
          title: 'Second Post',
          description: 'Another post',
          isPinned: true,
          createdAt: new Date(),
          board: {
            id: 'board-id-2',
            title: 'Bug Reports',
          },
          status: {
            id: 'status-id-2',
            name: 'In Progress',
            color: '#0000ff',
          },
          tags: [],
          author: {
            id: 'user-id-2',
            name: 'Jane Smith',
          },
          _count: {
            comments: 0,
            votes: 3,
          },
        },
      ];

      mockOrganizationsService.findPostsFromOrganization.mockResolvedValue(mockPosts);

      const result = await controller.findPostsFromOrganization(orgId, query);

      expect(mockOrganizationsService.findPostsFromOrganization).toHaveBeenCalledWith(orgId, query);
      expect(result).toEqual({ data: mockPosts });
    });
  });

  describe('findMembersFromOrganization', () => {
    it('should return all members from an organization', async () => {
      const orgId = 'org-id-1';
      const mockMembers = [
        {
          id: 'user-id-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'OWNER' as const,
          createdAt: new Date(),
        },
        {
          id: 'user-id-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'ADMIN' as const,
          createdAt: new Date(),
        },
        {
          id: 'user-id-3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'MEMBER' as const,
          createdAt: new Date(),
        },
      ];

      mockOrganizationsService.findMembersFromOrganization.mockResolvedValue(mockMembers);

      const result = await controller.findMembersFromOrganization(orgId);

      expect(mockOrganizationsService.findMembersFromOrganization).toHaveBeenCalledWith(orgId);
      expect(mockOrganizationsService.findMembersFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockMembers });
    });
  });

  describe('findTagsFromOrganization', () => {
    it('should return all tags from an organization', async () => {
      const orgId = 'org-id-1';
      const mockTags = [
        {
          id: 'tag-id-1',
          name: 'Feature',
          color: '#ff0000',
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'tag-id-2',
          name: 'Bug',
          color: '#00ff00',
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'tag-id-3',
          name: 'Enhancement',
          color: '#0000ff',
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockOrganizationsService.findTagsFromOrganization.mockResolvedValue(mockTags);

      const result = await controller.findTagsFromOrganization(orgId);

      expect(mockOrganizationsService.findTagsFromOrganization).toHaveBeenCalledWith(orgId);
      expect(mockOrganizationsService.findTagsFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockTags });
    });
  });

  describe('findStatusFromOrganization', () => {
    it('should return all status from an organization', async () => {
      const orgId = 'org-id-1';
      const mockStatus = [
        {
          id: 'status-id-1',
          name: 'To Do',
          color: '#ff0000',
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'status-id-2',
          name: 'In Progress',
          color: '#00ff00',
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'status-id-3',
          name: 'Done',
          color: '#0000ff',
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockOrganizationsService.findStatusFromOrganization.mockResolvedValue(mockStatus);

      const result = await controller.findStatusFromOrganization(orgId);

      expect(mockOrganizationsService.findStatusFromOrganization).toHaveBeenCalledWith(orgId);
      expect(mockOrganizationsService.findStatusFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockStatus });
    });
  });
});
