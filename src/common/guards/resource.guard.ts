import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESOURCE_RESOLVER } from 'src/constants';
import { ResourceOwnershipResolver } from '../interfaces/resource-info.interface';
import { UserPayload } from '../types/user-payload';
import { OrganizationRole } from '../types/user-organization-role';
import { ORG_ROLES_KEY } from '../decorators/organization-role.decorator';
import { ALLOW_AUTHOR_KEY } from '../decorators/allow-author.decorator';

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

    const allowedRoles =
      this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [context.getHandler(), context.getClass()]) ??
      [];

    if (!allowedRoles || allowedRoles.length === 0) {
      throw new ForbiddenException('Nenhum nível de acesso organizacional foi definido');
    }

    const allowAuthor =
      this.reflector.getAllAndOverride<boolean>(ALLOW_AUTHOR_KEY, [context.getHandler(), context.getClass()]) ?? false;

    const resourceInfo = await this.resourceResolver.findOrgAndAuthorId(resourceId);
    if (!resourceInfo) {
      throw new ForbiddenException('Recurso não encontrado');
    }

    if (allowAuthor && resourceInfo.authorId === user.id) {
      return true;
    }

    const userRolesInOrg = user.organizations
      .filter((org) => org.id === resourceInfo.organizationId)
      .map((org) => org.role);

    const hasPermission = userRolesInOrg.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      throw new ForbiddenException('Usuário não tem permissão para realizar esta operação');
    }

    return true;
  }
}
