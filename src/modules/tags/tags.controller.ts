import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * Create a new tag
   */
  @ApiBearerAuth()
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    return await this.tagsService.create(createTagDto);
  }

  /**
   * Returns a tag by ID
   */
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tag = await this.tagsService.findOne(id);
    return {
      data: tag,
    };
  }

  /**
   * Update a tag by ID
   */
  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    const tag = await this.tagsService.update(id, updateTagDto);
    return {
      data: tag,
    };
  }

  /**
   * Remove a tag by ID
   */
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.tagsService.remove(id);
  }
}
