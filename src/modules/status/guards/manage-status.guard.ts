import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StatusService } from '../status.service';
import { OrganizationRole } from 'src/common/types/user-organization-role';
import { UserPayload } from 'src/common/types/user-payload';
import { ORG_ROLES_KEY } from 'src/common/decorators/organization-role-decorator';

@Injectable()
export class ManageStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly statusService: StatusService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const statusId = request.params.id;
    const user = request.user as UserPayload;

    const allowedRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const statusInfo = await this.statusService.findOne(statusId);
    if (!statusInfo) {
      return false;
    }

    const userRolesInOrg = user.organizations
      .filter((org) => org.id === statusInfo.organizationId)
      .map((org) => org.role);

    return userRolesInOrg.some((role) => allowedRoles.includes(role));
  }
}
