import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommentsService } from '../comments.service';
import { OrganizationRole } from 'src/common/types/user-organization-role';
import { ORG_ROLES_KEY } from 'src/common/decorators/organization-role-decorator';
import { UserPayload } from 'src/common/types/user-payload';

@Injectable()
export class MutateCommentGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly commentService: CommentsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;
    const commentId = request.params.id;
    const allowedRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

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
