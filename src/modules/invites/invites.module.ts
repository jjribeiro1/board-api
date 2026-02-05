import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { InvitesRepository } from './invites.repository';
import { RESOURCE_RESOLVER } from 'src/constants';

@Module({
  imports: [OrganizationsModule],
  controllers: [InvitesController],
  providers: [InvitesService, { provide: RESOURCE_RESOLVER, useExisting: InvitesService }, InvitesRepository],
})
export class InvitesModule {}
