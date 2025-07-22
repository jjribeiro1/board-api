import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

export class ManagePostDto extends PartialType(CreatePostDto) {}
