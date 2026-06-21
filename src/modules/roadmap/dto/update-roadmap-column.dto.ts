import { PartialType } from '@nestjs/mapped-types';
import { CreateRoadmapColumnDto } from './create-roadmap-column.dto';

export class UpdateRoadmapColumnDto extends PartialType(CreateRoadmapColumnDto) {}
