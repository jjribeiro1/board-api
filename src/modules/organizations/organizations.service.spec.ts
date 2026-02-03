import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListPostsQueryDto } from './dto/list-post-query.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { EVENTS } from 'src/constants/events';
import { OrganizationCreatedEventDto } from '../events/dto/organization-created-event.dto';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let organizationsRepositoryMock: DeepMockProxy<OrganizationsRepository>;
  let eventEmitterMock: DeepMockProxy<EventEmitter2>;

  beforeEach(async () => {
    organizationsRepositoryMock = mockDeep<OrganizationsRepository>();
    eventEmitterMock = mockDeep<EventEmitter2>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: OrganizationsRepository,
          useValue: organizationsRepositoryMock,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitterMock,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a new organization, emit event and return the ID', async () => {
      const dto: CreateOrganizationDto = {
        name: 'Test Organization',
        logoUrl: null,
      };
      const userId = 'user-id-1';
      const expectedId = 'org-id-1';
      const slug = 'test-organization';
      organizationsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto, userId);

      expect(organizationsRepositoryMock.create).toHaveBeenCalledWith(dto, slug, userId);
      expect(organizationsRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        EVENTS.organization.created,
        new OrganizationCreatedEventDto(expectedId, userId),
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should return an organization when found', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
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

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);

      const result = await service.findOne(organizationId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOrganization);
    });

    it('should throw NotFoundException when organization is not found', async () => {
      const organizationId = 'non-existent-id';

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.findOne(organizationId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findBoardsFromOrganization', () => {
    it('should return all boards from an organization', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockBoards = [
        {
          id: 'board-id-1',
          title: 'Feature Requests',
          description: 'Submit your feature ideas',
          isPrivate: false,
          isLocked: false,
          organizationId,
          authorId: 'user-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          _count: { posts: 5 },
        },
      ];

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findBoardsFromOrganization.mockResolvedValue(mockBoards);

      const result = await service.findBoardsFromOrganization(organizationId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findBoardsFromOrganization).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findBoardsFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBoards);
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      const organizationId = 'non-existent-id';

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.findBoardsFromOrganization(organizationId)).rejects.toThrow(
        new NotFoundException(errorMessage),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findBoardsFromOrganization).not.toHaveBeenCalled();
    });
  });

  describe('findPostsFromOrganization', () => {
    it('should return posts from organization with filters', async () => {
      const organizationId = 'org-id-1';
      const filters: ListPostsQueryDto = {
        status: ['status-id-1'],
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

      organizationsRepositoryMock.findPostsFromOrganization.mockResolvedValue(mockPosts);

      const result = await service.findPostsFromOrganization(organizationId, filters);

      expect(organizationsRepositoryMock.findPostsFromOrganization).toHaveBeenCalledWith(organizationId, filters);
      expect(organizationsRepositoryMock.findPostsFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPosts);
    });

    it('should return posts without filters', async () => {
      const organizationId = 'org-id-1';
      const filters: ListPostsQueryDto = {};
      const mockPosts = [
        {
          id: 'post-id-1',
          title: 'Post 1',
          description: 'Description 1',
          isPinned: false,
          createdAt: new Date(),
          board: { id: 'board-id-1', title: 'Board 1' },
          status: { id: 'status-id-1', name: 'Open', color: '#ff0000' },
          tags: [],
          author: { id: 'user-id-1', name: 'User 1' },
          _count: { comments: 0, votes: 0 },
        },
        {
          id: 'post-id-2',
          title: 'Post 2',
          description: 'Description 2',
          isPinned: true,
          createdAt: new Date(),
          board: { id: 'board-id-2', title: 'Board 2' },
          status: { id: 'status-id-2', name: 'Closed', color: '#00ff00' },
          tags: [],
          author: { id: 'user-id-2', name: 'User 2' },
          _count: { comments: 3, votes: 10 },
        },
      ];

      organizationsRepositoryMock.findPostsFromOrganization.mockResolvedValue(mockPosts);

      const result = await service.findPostsFromOrganization(organizationId, filters);

      expect(organizationsRepositoryMock.findPostsFromOrganization).toHaveBeenCalledWith(organizationId, filters);
      expect(result).toEqual(mockPosts);
    });

    it('should return empty array when no posts match filters', async () => {
      const organizationId = 'org-id-1';
      const filters: ListPostsQueryDto = {
        status: ['non-existent-status'],
      };

      organizationsRepositoryMock.findPostsFromOrganization.mockResolvedValue([]);

      const result = await service.findPostsFromOrganization(organizationId, filters);

      expect(organizationsRepositoryMock.findPostsFromOrganization).toHaveBeenCalledWith(organizationId, filters);
      expect(result).toEqual([]);
    });
  });

  describe('findMembersFromOrganization', () => {
    it('should return formatted members from an organization', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockRawMembers = [
        {
          id: 'user-org-id-1',
          userId: 'user-id-1',
          name: 'Member Name 1',
          role: 'OWNER' as const,
          createdAt: new Date(),
          user: {
            id: 'user-id-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          id: 'user-org-id-2',
          userId: 'user-id-2',
          name: 'Member Name 2',
          role: 'ADMIN' as const,
          createdAt: new Date(),
          user: {
            id: 'user-id-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      ];
      const expectedMembers = [
        {
          id: 'user-id-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'OWNER' as const,
          createdAt: mockRawMembers[0].createdAt,
        },
        {
          id: 'user-id-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'ADMIN' as const,
          createdAt: mockRawMembers[1].createdAt,
        },
      ];

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMembersFromOrganization.mockResolvedValue(mockRawMembers);

      const result = await service.findMembersFromOrganization(organizationId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMembersFromOrganization).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMembersFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedMembers);
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      const organizationId = 'non-existent-id';

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.findMembersFromOrganization(organizationId)).rejects.toThrow(
        new NotFoundException(errorMessage),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMembersFromOrganization).not.toHaveBeenCalled();
    });
  });

  describe('findTagsFromOrganization', () => {
    it('should return all tags from an organization', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockTags = [
        {
          id: 'tag-id-1',
          name: 'Feature',
          color: '#ff0000',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'tag-id-2',
          name: 'Bug',
          color: '#00ff00',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findTagsFromOrganization.mockResolvedValue(mockTags);

      const result = await service.findTagsFromOrganization(organizationId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findTagsFromOrganization).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findTagsFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTags);
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      const organizationId = 'non-existent-id';

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.findTagsFromOrganization(organizationId)).rejects.toThrow(
        new NotFoundException(errorMessage),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findTagsFromOrganization).not.toHaveBeenCalled();
    });
  });

  describe('findStatusFromOrganization', () => {
    it('should return all status from an organization', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockStatus = [
        {
          id: 'status-id-1',
          name: 'To Do',
          color: '#ff0000',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'status-id-2',
          name: 'In Progress',
          color: '#00ff00',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization as any);
      organizationsRepositoryMock.findStatusFromOrganization.mockResolvedValue(mockStatus);

      const result = await service.findStatusFromOrganization(organizationId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findStatusFromOrganization).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findStatusFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStatus);
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      const organizationId = 'non-existent-id';

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.findStatusFromOrganization(organizationId)).rejects.toThrow(
        new NotFoundException(errorMessage),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findStatusFromOrganization).not.toHaveBeenCalled();
    });
  });

  describe('setDefaultStatus', () => {
    it('should set default status for an organization', async () => {
      const organizationId = 'org-id-1';
      const statusId = 'status-id-1';

      organizationsRepositoryMock.setDefaultStatus.mockResolvedValue(undefined);

      await service.setDefaultStatus(organizationId, statusId);

      expect(organizationsRepositoryMock.setDefaultStatus).toHaveBeenCalledWith(organizationId, statusId);
      expect(organizationsRepositoryMock.setDefaultStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('findInvitesFromOrganization', () => {
    it('should return all invites from an organization', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockInvites = [
        {
          id: 'invite-id-1',
          email: 'invited1@example.com',
          role: 'MEMBER' as const,
          status: 'PENDING' as const,
          expiresAt: new Date('2026-02-27'),
          acceptedAt: null,
          createdAt: new Date(),
          invitedBy: {
            id: 'user-id-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          id: 'invite-id-2',
          email: 'invited2@example.com',
          role: 'ADMIN' as const,
          status: 'ACCEPTED' as const,
          expiresAt: new Date('2026-02-27'),
          acceptedAt: new Date(),
          createdAt: new Date(),
          invitedBy: {
            id: 'user-id-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      ];

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization as any);
      organizationsRepositoryMock.findInvitesFromOrganization.mockResolvedValue(mockInvites);

      const result = await service.findInvitesFromOrganization(organizationId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findInvitesFromOrganization).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findInvitesFromOrganization).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInvites);
    });

    it('should return empty array when organization has no invites', async () => {
      const organizationId = 'org-id-1';
      const mockOrganization = {
        id: organizationId,
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

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization as any);
      organizationsRepositoryMock.findInvitesFromOrganization.mockResolvedValue([]);

      const result = await service.findInvitesFromOrganization(organizationId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findInvitesFromOrganization).toHaveBeenCalledWith(organizationId);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      const organizationId = 'non-existent-id';

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.findInvitesFromOrganization(organizationId)).rejects.toThrow(
        new NotFoundException(errorMessage),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findInvitesFromOrganization).not.toHaveBeenCalled();
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const organizationId = 'org-id-1';
      const userId = 'user-id-1';
      const dto: UpdateMemberRoleDto = { role: OrganizationRolesOptions.ADMIN };
      const mockOrganization = {
        id: organizationId,
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
      const mockMember = {
        role: OrganizationRolesOptions.MEMBER,
      };

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMember.mockResolvedValue(mockMember);
      organizationsRepositoryMock.updateMemberRole.mockResolvedValue(undefined);

      await service.updateMemberRole(organizationId, userId, dto);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).toHaveBeenCalledWith(organizationId, userId);
      expect(organizationsRepositoryMock.updateMemberRole).toHaveBeenCalledWith(organizationId, userId, dto.role);
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      const organizationId = 'non-existent-id';
      const userId = 'user-id-1';
      const dto: UpdateMemberRoleDto = { role: OrganizationRolesOptions.ADMIN };

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.updateMemberRole(organizationId, userId, dto)).rejects.toThrow(
        new NotFoundException(errorMessage),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).not.toHaveBeenCalled();
      expect(organizationsRepositoryMock.updateMemberRole).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when member does not exist', async () => {
      const organizationId = 'org-id-1';
      const userId = 'user-id-1';
      const dto: UpdateMemberRoleDto = { role: OrganizationRolesOptions.ADMIN };
      const mockOrganization = {
        id: organizationId,
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

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMember.mockResolvedValue(null);

      await expect(service.updateMemberRole(organizationId, userId, dto)).rejects.toThrow(
        new NotFoundException('membro não encontrado'),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).toHaveBeenCalledWith(organizationId, userId);
      expect(organizationsRepositoryMock.updateMemberRole).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to update owner role', async () => {
      const organizationId = 'org-id-1';
      const userId = 'user-id-1';
      const dto: UpdateMemberRoleDto = { role: OrganizationRolesOptions.ADMIN };
      const mockOrganization = {
        id: organizationId,
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
      const mockMember = {
        role: OrganizationRolesOptions.OWNER,
      };

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMember.mockResolvedValue(mockMember);

      await expect(service.updateMemberRole(organizationId, userId, dto)).rejects.toThrow(
        new BadRequestException('não é possível alterar o papel do proprietário'),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).toHaveBeenCalledWith(organizationId, userId);
      expect(organizationsRepositoryMock.updateMemberRole).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const organizationId = 'org-id-1';
      const userId = 'user-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockMember = {
        role: OrganizationRolesOptions.MEMBER,
      };

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMember.mockResolvedValue(mockMember);
      organizationsRepositoryMock.removeMember.mockResolvedValue(undefined);

      await service.removeMember(organizationId, userId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).toHaveBeenCalledWith(organizationId, userId);
      expect(organizationsRepositoryMock.removeMember).toHaveBeenCalledWith(organizationId, userId);
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      const organizationId = 'non-existent-id';
      const userId = 'user-id-1';

      organizationsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `organização com id: ${organizationId} não encontrada`;

      await expect(service.removeMember(organizationId, userId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).not.toHaveBeenCalled();
      expect(organizationsRepositoryMock.removeMember).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when member does not exist', async () => {
      const organizationId = 'org-id-1';
      const userId = 'user-id-1';
      const mockOrganization = {
        id: organizationId,
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

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMember.mockResolvedValue(null);

      await expect(service.removeMember(organizationId, userId)).rejects.toThrow(
        new NotFoundException('membro não encontrado'),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).toHaveBeenCalledWith(organizationId, userId);
      expect(organizationsRepositoryMock.removeMember).not.toHaveBeenCalled();
    });

    it('should remove owner member when there are multiple owners', async () => {
      const organizationId = 'org-id-1';
      const userId = 'user-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockMember = {
        role: OrganizationRolesOptions.OWNER,
      };

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMember.mockResolvedValue(mockMember);
      organizationsRepositoryMock.countOwners.mockResolvedValue(2);
      organizationsRepositoryMock.removeMember.mockResolvedValue(undefined);

      await service.removeMember(organizationId, userId);

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).toHaveBeenCalledWith(organizationId, userId);
      expect(organizationsRepositoryMock.countOwners).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.removeMember).toHaveBeenCalledWith(organizationId, userId);
    });

    it('should throw BadRequestException when trying to remove the last owner', async () => {
      const organizationId = 'org-id-1';
      const userId = 'user-id-1';
      const mockOrganization = {
        id: organizationId,
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
      const mockMember = {
        role: OrganizationRolesOptions.OWNER,
      };

      organizationsRepositoryMock.findOne.mockResolvedValue(mockOrganization);
      organizationsRepositoryMock.findMember.mockResolvedValue(mockMember);
      organizationsRepositoryMock.countOwners.mockResolvedValue(1);

      await expect(service.removeMember(organizationId, userId)).rejects.toThrow(
        new BadRequestException('a organização deve ter pelo menos um proprietário'),
      );

      expect(organizationsRepositoryMock.findOne).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.findMember).toHaveBeenCalledWith(organizationId, userId);
      expect(organizationsRepositoryMock.countOwners).toHaveBeenCalledWith(organizationId);
      expect(organizationsRepositoryMock.removeMember).not.toHaveBeenCalled();
    });
  });
});
