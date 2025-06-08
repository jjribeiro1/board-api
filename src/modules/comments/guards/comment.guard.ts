import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OrganizationRole, OrganizationRolesOptions } from 'src/common/types/user-organization-role';
import { CommentsService } from '../comments.service';

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
export class MutateCommentGuard implements CanActivate {
  constructor(private readonly commentService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;
    const commentId = request.params.id;
    const allowedRoles: OrganizationRole[] = [OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN];

    const authorAndOrgIdFromComment = await this.commentService.findAuthorAndOrgIdFromComment(commentId);
    if (!authorAndOrgIdFromComment) {
      return false;
    }
    if (authorAndOrgIdFromComment.authorId === user.id) {
      return true;
    }

    const userRoles = user.organizations
      .filter((org) => org.organizationId === authorAndOrgIdFromComment.organizationId)
      .map((org) => org.role);

    return userRoles.some((role) => allowedRoles.includes(role));
  }
}
