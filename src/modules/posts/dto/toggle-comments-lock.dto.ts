import { IsBoolean } from 'class-validator';

export class TogglePostCommentsLockDto {
  /**
   * Indicates whether comments on the post should be locked or unlocked
   * @example true
   */
  @IsBoolean({ message: 'isLocked must be a boolean value' })
  isLocked: boolean;
}
