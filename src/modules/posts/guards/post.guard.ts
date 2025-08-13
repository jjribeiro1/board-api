import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PostsService } from '../posts.service';
import { OrganizationRole } from 'src/common/types/user-organization-role';
import { ORG_ROLES_KEY } from 'src/common/decorators/organization-role-decorator';
import { UserPayload } from 'src/common/types/user-payload';

@Injectable()
export class MutatePostGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly postService: PostsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;
    const postId = request.params.id;
    const allowedRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const authorAndOrgIdFromPost = await this.postService.findAuthorAndOrgIdFromPost(postId);
    if (!authorAndOrgIdFromPost) {
      return false;
    }

    if (authorAndOrgIdFromPost.authorId === user.id) {
      return true;
    }

    const userRoles = user.organizations
      .filter((org) => org.organizationId === authorAndOrgIdFromPost.organizationId)
      .map((org) => org.role);

    return userRoles.some((role) => allowedRoles.includes(role));
  }
}
