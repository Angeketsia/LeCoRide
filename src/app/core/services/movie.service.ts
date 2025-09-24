
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { delay, map, Observable, of, switchMap } from "rxjs";

import { Movie } from "../models/movie.model";

@Injectable({
  providedIn: "root",
})
export class MovieService {
  constructor(private http: HttpClient) { }

private movies: Movie[] = [
    {
      id: 1,
      titre: 'Inception',
    annee: 2010,
      directeur: 'Angels Miles',
      description: 'Rêves imbriqués et braquage onirique.',
      image: 'https://picsum.photos/seed/inception/600/400',
      createdDate: new Date('2023-05-18'),
    compteurLike: 5,
    commentaire: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un film fantastique !',
          createdDate: '2023-05-19',
        }
      ]
    },
    {
      id: 2,
      titre: 'Black Panther',
      directeur: 'Angels Miles',
      annee: 2018,
      description: 'Wakanda forever — héritage, identité et responsabilité.',
      image: 'https://picsum.photos/seed/blackpanther/600/400',
      createdDate: new Date('2023-08-02'),
      compteurLike: 5,
      commentaire: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un film fantastique !',
          createdDate: '2023-05-19',
        }
      ]
    },
    {
      id: 3,
      titre: 'Parasite',
      annee: 2019,
      description: 'Satire sociale acérée, tensions et retournements.',
      image: 'https://picsum.photos/seed/parasite/600/400',
      createdDate: new Date('2023-09-25'),
      compteurLike: 5,
      directeur: 'Angels Miles',
      commentaire: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un film fantastique !',
          createdDate: '2023-05-19',
        }
      ]

    },
    {
      id: 4,
      titre: 'The Matrix',
      annee: 1999,
      directeur: 'Angels Miles',
      description: 'Qu’est-ce que la réalité ? Choisis la pilule.',
      image: 'https://picsum.photos/seed/matrix/600/400',
      createdDate: new Date('2024-01-22'),
      compteurLike: 5,
      commentaire: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un film fantastique !',
          createdDate: '2023-05-19',
        }
      ]

    },
    {
      id: 5,
      titre: 'Spirited Away',
      annee: 2001,
      directeur: 'Angels Miles',
      description: 'Voyage initiatique au pays des esprits (Ghibli).',
      image: 'https://picsum.photos/seed/spiritedaway/600/400',
      createdDate: new Date('2024-03-03'),
      compteurLike: 5,
      commentaire: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un film fantastique !',
          createdDate: '2023-05-19',
        }
      ]

    },
    {
      id: 6,
      titre: 'The Godfather',
      annee: 1972,
      directeur: 'Angels Miles',
      description: 'Famille Corleone, loyautés et pouvoir.',
      image: 'https://picsum.photos/seed/godfather/600/400',
      createdDate: new Date('2024-04-11'),
      compteurLike: 5,
      commentaire: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un film fantastique !',
          createdDate: '2023-05-19',
        }
      ]

    }
  ];

  getAll(): Observable<Movie[]> {
    return of(this.movies).pipe(delay(300));
  }

  getById(id: number): Observable<Movie | undefined> {
    return this.getAll().pipe(map(list => list.find(m => m.id === id)));
  }

  addNewMovie(movie: Omit<Movie, 'id' | 'createdDate' | 'compteurLike'>): Observable<Movie> {
      return this.getAll().pipe(
        map(movies => {
          // tri par id
          const sortedMovies = [...movies].sort((a, b) => a.id - b.id);
          // dernier id
          const lastId = sortedMovies.length ? sortedMovies[sortedMovies.length - 1].id : 0;
          return lastId;
        }),
        switchMap(lastId => {
          const newMovie: Movie = {
            id: lastId + 1,
            createdDate: new Date(),
            compteurLike: 0,
            ...movie  // merge les champs fournis
          };
          // on ajoute le livre au tableau local
          this.movies = [newMovie, ...this.movies];
          // on retourne un observable
          return of(newMovie);
        })
      );
    }

    addLikeMovie(movieId: number): void {
      const movie = this.movies.find(b => b.id === movieId);
      if (movie) {
        movie.compteurLike++;

      }
    }

    removeLikeMovie(movieId: number): void {
      const movie = this.movies.find(b => b.id === movieId);
      if (movie && movie.compteurLike > 0) {
        movie.compteurLike--;

      }
    }
}
