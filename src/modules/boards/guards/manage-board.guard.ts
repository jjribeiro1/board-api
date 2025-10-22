import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BoardsService } from '../boards.service';
import { OrganizationRole } from 'src/common/types/user-organization-role';
import { UserPayload } from 'src/common/types/user-payload';
import { ORG_ROLES_KEY } from 'src/common/decorators/organization-role-decorator';

@Injectable()
export class ManageBoardGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly boardsService: BoardsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const boardId = request.params.id;
    const user = request.user as UserPayload;

    const allowedRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const board = await this.boardsService.findOne(boardId);
    const organizationIdFromBoard = board.organizationId;

    const userRolesInOrg = user.organizations
      .filter((org) => org.id === organizationIdFromBoard)
      .map((org) => org.role);

    return userRolesInOrg.some((role) => allowedRoles.includes(role));
  }
}
