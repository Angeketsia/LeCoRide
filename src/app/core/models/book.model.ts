import { BookComment } from "./book.comment.model";
import { Reaction } from "./reaction.model";

export class Book{
  id!: number;
  titre!: string;
  description!: string;
  image!: string;
  auteur?: string;
  createdDate!: Date;
  compteurLike!: number;
  commentaires?: BookComment[];
  isLiked?: boolean; //suivre si le user a like

}
