import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PostsService } from '../posts.service';
import { OrganizationRole } from 'src/common/types/user-organization-role';
import { UserPayload } from 'src/common/types/user-payload';
import { ORG_ROLES_KEY } from 'src/common/decorators/organization-role-decorator';

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

    const allowedRoles: OrganizationRole[] = this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

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
