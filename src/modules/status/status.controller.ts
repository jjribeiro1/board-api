import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AllowedOrganizationRoles } from 'src/common/decorators/organization-role.decorator';
import { ResourceGuard } from 'src/common/guards/resource.guard';
import { OrganizationGuard } from 'src/common/guards/organization.guard';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  /**
   * Creates a new status
   *
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(OrganizationGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateStatusDto) {
    return await this.statusService.create(dto);
  }

  /**
   * Update an existing status
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const updatedStatus = await this.statusService.update(id, dto);
    return {
      data: updatedStatus,
    };
  }

  /**
   * Delete an existing status
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.statusService.remove(id);
  }
}
