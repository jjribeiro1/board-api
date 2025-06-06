import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ORG_ROLES_KEY } from 'src/common/decorators/organization-role-decorator';
import { OrganizationRole } from 'src/common/types/user-organization-role';

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
export class OrganizationRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const req: Request = ctx.switchToHttp().getRequest();
    const user = req['user'] as UserPayload;
    const allowedRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(ORG_ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (allowedRoles.length === 0) {
      return true;
    }
    const userRoles = user.organizations.map((org) => org.role);
    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    return hasPermission;
  }
}
