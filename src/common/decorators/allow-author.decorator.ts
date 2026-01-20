import { SetMetadata } from '@nestjs/common';

export const ALLOW_AUTHOR_KEY = 'allowAuthor';
export const AllowAuthor = () => SetMetadata(ALLOW_AUTHOR_KEY, true);
