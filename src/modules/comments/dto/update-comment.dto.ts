import { IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  /**
   * content of comment
   * @example 'I like this suggestion'
   */
  @IsNotEmpty({ message: 'Comentário não pode estar vazio' })
  content: string;
}
