import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PostsService } from '../posts.service';
import { OrganizationRole, OrganizationRolesOptions } from 'src/common/types/user-organization-role';
import { UserPayload } from 'src/common/types/user-payload';

@Injectable()
export class MutatePostGuard implements CanActivate {
  constructor(private readonly postService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;
    const postId = request.params.id;
    const allowedRoles: OrganizationRole[] = [OrganizationRolesOptions.OWNER];

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
