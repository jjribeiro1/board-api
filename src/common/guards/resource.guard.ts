import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESOURCE_RESOLVER } from 'src/constants';
import { ResourceOwnershipResolver } from '../interfaces/resource-info.interface';
import { UserPayload } from '../types/user-payload';
import { OrganizationRole } from '../types/user-organization-role';
import { ORG_ROLES_KEY } from '../decorators/organization-role-decorator';

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(RESOURCE_RESOLVER) private resourceResolver: ResourceOwnershipResolver,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload;
    const resourceId = request.params.id;

    const allowedRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const resourceInfo = await this.resourceResolver.findOrgAndAuthorId(resourceId);
    if (!resourceInfo) {
      return false;
    }

    const { organizationId } = resourceInfo;

    const userRolesInOrg = user.organizations.filter((org) => org.id === organizationId).map((org) => org.role);

    const hasRoleAccess = userRolesInOrg.some((role) => allowedRoles.includes(role));
    if (!hasRoleAccess) {
      return false;
    }

    return true;
  }
}
