import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { InvitesRepository } from './invites.repository';

@Module({
  imports: [OrganizationsModule],
  controllers: [InvitesController],
  providers: [InvitesService, InvitesRepository],
})
export class InvitesModule {}
