import { PartialType, PickType } from '@nestjs/swagger';
import { CreateStatusDto } from './create-status.dto';

export class UpdateStatusDto extends PartialType(PickType(CreateStatusDto, ['name', 'color'] as const)) {}
