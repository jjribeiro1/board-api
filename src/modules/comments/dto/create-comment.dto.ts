import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCommentDto {
  /**
   * content of comment
   * @example 'I like this suggestion'
   */
  @IsNotEmpty({ message: 'Comentário não pode estar vazio' })
  content: string;

  /**
   * post ID
   * @example '0f3b269a-447f-49dc-a804-54585c0fb106'
   */
  @IsUUID('4', { message: 'ID da postagem deve ser um UUID válido' })
  postId: string;
}
