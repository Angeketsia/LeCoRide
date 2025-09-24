import { MovieComment } from "./movie.comment.module";
import { Reaction } from "./reaction.model";

export class Movie{
  id!: number;
  titre!: string;
  annee!: number;
  description!: string;
  directeur?: string;
  image!: string;
  createdDate!: Date;
  compteurLike!: number;
  commentaire?: MovieComment[];
  isLiked?: boolean; //suivre si le user a like

}
