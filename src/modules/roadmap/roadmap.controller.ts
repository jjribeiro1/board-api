import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoadmapService } from './roadmap.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { CreateRoadmapColumnDto } from './dto/create-roadmap-column.dto';
import { UpdateRoadmapColumnDto } from './dto/update-roadmap-column.dto';
import { ReorderRoadmapColumnsDto } from './dto/reorder-roadmap-columns.dto';
import { AddPostToRoadmapDto } from './dto/add-post-to-roadmap.dto';
import { ReorderRoadmapItemsDto } from './dto/reorder-roadmap-items.dto';
import { AllowedOrganizationRoles } from 'src/common/decorators/organization-role.decorator';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';
import { ResourceGuard } from 'src/common/guards/resource.guard';

@ApiTags('roadmap')
@Controller()
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  /**
   * Create new Roadmap and returns the ID
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Post('roadmaps')
  async create(@Body() dto: CreateRoadmapDto) {
    const id = await this.roadmapService.create(dto);
    return { data: { id } };
  }

  /**
   * Returns a roadmap by ID
   */
  @ApiBearerAuth()
  @Get('roadmaps/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const roadmap = await this.roadmapService.findOne(id);
    return { data: roadmap };
  }

  /**
   * Update Roadmap
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Patch('roadmaps/:id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoadmapDto) {
    const roadmap = await this.roadmapService.update(id, dto);
    return { data: roadmap };
  }

  /**
   * Delete Roadmap
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Delete('roadmaps/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.roadmapService.remove(id);
  }

  /**
   * Add column to Roadmap
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Post('roadmaps/:id/columns')
  async addColumn(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateRoadmapColumnDto) {
    const columnId = await this.roadmapService.addColumn(id, dto);
    return { data: { id: columnId } };
  }

  /**
   * Update Roadmap Column
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Patch('roadmap-columns/:id')
  async updateColumn(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoadmapColumnDto) {
    const column = await this.roadmapService.updateColumn(id, dto);
    return { data: column };
  }

  /**
   * Delete Roadmap Column
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Delete('roadmap-columns/:id')
  async deleteColumn(@Param('id', ParseUUIDPipe) id: string) {
    await this.roadmapService.deleteColumn(id);
  }

  /**
   * Reorder Roadmap Columns
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Put('roadmap-columns/reorder')
  async reorderColumns(@Body() dto: ReorderRoadmapColumnsDto) {
    await this.roadmapService.reorderColumns(dto);
  }

  /**
   * Add Post to Roadmap Column
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Post('roadmap-columns/:id/items')
  async addPostToColumn(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddPostToRoadmapDto) {
    const itemId = await this.roadmapService.addPostToColumn(id, dto);
    return { data: { id: itemId } };
  }

  /**
   * Remove item from Roadmap
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Delete('roadmap-items/:id')
  async removeItem(@Param('id', ParseUUIDPipe) id: string) {
    await this.roadmapService.removeItem(id);
  }

  /**
   * Reorder Roadmap Items in Column
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ResourceGuard)
  @Put('roadmap-columns/:id/items/reorder')
  async reorderItems(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReorderRoadmapItemsDto) {
    await this.roadmapService.reorderItems(id, dto);
  }
}
