import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationRole } from 'src/common/types/user-organization-role';
import { PostsService } from '../posts.service';

type UserPayload = {
  id: string;
  name: string;
  email: string;
  organizations: {
    organizationId: string;
    role: OrganizationRole;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ManagePostGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly postsService: PostsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const postId = request.params.id;
    const user = request.user as UserPayload;

    const allowedRoles: OrganizationRole[] = this.reflector.get<OrganizationRole[]>(
      context.getHandler(),
      context.getClass(),
    );

    const orgAndAuthorIdFromPost = await this.postsService.findAuthorAndOrgIdFromPost(postId);
    if (!orgAndAuthorIdFromPost) {
      return false;
    }
    const organizationIdFromPost = orgAndAuthorIdFromPost.organizationId;

    const userRoles = user.organizations
      .filter((org) => org.organizationId === organizationIdFromPost)
      .map((org) => org.role);

    return userRoles.some((role) => allowedRoles.includes(role));
  }
}
