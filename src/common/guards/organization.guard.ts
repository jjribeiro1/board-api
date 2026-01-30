import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORG_ROLES_KEY } from 'src/common/decorators/organization-role.decorator';
import { OrganizationRole } from 'src/common/types/user-organization-role';
import { UserPayload } from 'src/common/types/user-payload';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles =
      this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [context.getHandler(), context.getClass()]) ??
      [];

    if (!allowedRoles || allowedRoles.length === 0) {
      throw new ForbiddenException('Nenhum nível de acesso organizacional foi definido');
    }

    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;
    const organizationId = request.body?.organizationId || request.params?.id;

    if (!organizationId) {
      throw new ForbiddenException('ID da organização é obrigatório');
    }

    const userOrg = user.organizations.find((org) => org.id === organizationId);

    if (!userOrg) {
      throw new ForbiddenException('Usuário não pertence a esta organização');
    }

    const hasPermission = allowedRoles.includes(userOrg.role);

    if (!hasPermission) {
      throw new ForbiddenException('Usuário não tem permissão para realizar esta operação');
    }

    return true;
  }
}
