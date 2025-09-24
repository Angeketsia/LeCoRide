import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { delay, map, Observable, of, switchMap } from "rxjs";

import { Book } from "../models/book.model";

@Injectable({
  providedIn: "root",
})
export class BookService {
  constructor(private http: HttpClient) {}

  private books: Book[] = [
    {
      id: 1,
      titre: 'Le Petit Prince',
      auteur: 'Antoine de Saint-Exupéry',
      description: 'Un conte poétique et philosophique sur l’enfance et le sens de la vie.',
      image: 'https://picsum.photos/seed/petitprince/600/400',
      createdDate: new Date('2023-05-01'),
      compteurLike: 4,
      commentaires: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un livre fantastique !',
          createdDate: '2023-05-02',
        }
      ]
    },
    {
      id: 2,
      titre: '1984',
      auteur: 'George Orwell',
      description: 'Dystopie sur la surveillance, la propagande et la liberté.',
      image: 'https://picsum.photos/seed/1984/600/400',
      createdDate: new Date('2023-06-15'),
      compteurLike: 5,
      commentaires: [
        {
          id: 1,
          userId: 1,
          userName: 'John Doe',
          comment: 'Un livre fantastique !',
          createdDate: '2023-05-02',
        }
      ]
    },
    {
      id: 3,
      titre: 'Things Fall Apart',
      auteur: 'Chinua Achebe',
      description: 'Classique de la littérature africaine sur le choc des cultures.',
      image: 'https://picsum.photos/seed/thingsfallapart/600/400',
      createdDate: new Date('2023-07-10'),
      compteurLike: 5,
      commentaires: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un livre fantastique !',
          createdDate: '2023-05-02',
        }
      ]
    },
    {
      id: 4,
      titre: 'L’Étranger',
      auteur: 'Albert Camus',
      description: 'Roman existentiel qui interroge l’absurde et la condition humaine.',
      image: 'https://picsum.photos/seed/etranger/600/400',
      createdDate: new Date('2024-01-05'),
      compteurLike: 5,
      commentaires: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un livre fantastique !',
          createdDate: '2023-05-02',
        }
      ]
    },
    {
      id: 5,
      titre: 'To Kill a Mockingbird',
      auteur: 'Harper Lee',
      description: 'Roman sur la justice, l’innocence et le racisme aux États-Unis.',
      image: 'https://picsum.photos/seed/mockingbird/600/400',
      createdDate: new Date('2024-02-20'),
      compteurLike: 150,
      commentaires: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un livre fantastique !',
          createdDate: '2023-05-02',
        }
      ]
    },
    {
      id: 6,
      titre: 'Cent ans de solitude',
      auteur: 'Gabriel García Márquez',
      description: 'Saga familiale et réalisme magique à Macondo.',
      image: 'https://picsum.photos/seed/solitude/600/400',
      createdDate: new Date('2024-03-12'),
      compteurLike: 100,
      commentaires: [
        {
          id: 1,
          userId: 2,
          userName: 'John Doe',
          comment: 'Un livre fantastique !',
          createdDate: '2023-05-02',
        }
      ]
    }
  ];


  // fonction qui recupere les books avec un mini delai
  getAll(): Observable<Book[]> {
    return of(this.books).pipe(delay(300));
  }

  // je filtre la fonction getAll pour recuperer l'id correspondant
  getById(id: number): Observable<Book | undefined> {
    return this.getAll().pipe(map(list => list.find(b => b.id === id)));
  }

  // Omit prend un type existant et retire certaines proprietes

  addNewBook(book: Omit<Book, 'id' | 'createdDate' | 'compteurLike'>): Observable<Book> {
    return this.getAll().pipe(
      map(books => {
        // tri par id
        const sortedBooks = [...books].sort((a, b) => a.id - b.id);
        // dernier id
        const lastId = sortedBooks.length ? sortedBooks[sortedBooks.length - 1].id : 0;
        return lastId;
      }),
      switchMap(lastId => {
        const newBook: Book = {
          id: lastId + 1,
          createdDate: new Date(),
          compteurLike: 0,
          ...book  // merge les champs fournis
        };
        // on ajoute le livre au tableau local
        this.books = [newBook, ...this.books];
        // on retourne un observable
        return of(newBook);
      })
    );
  }

  addLikeBook(bookId: number): void {
    const book = this.books.find(b => b.id === bookId);
    if (book) {
      book.compteurLike++;

    }
  }

  removeLikeBook(bookId: number): void {
    const book = this.books.find(b => b.id === bookId);
    if (book && book.compteurLike > 0) {
      book.compteurLike--;

    }
  }

  addNewComment(postCommented: { comment: string, postId: number }) {
      console.log(postCommented);
  }

  // reactionById(bookId: number, reactionType: 'like' | 'unlike'): void {
  //   const book = this.books.find(fs => fs.id === bookId);
  //   if (book) {
  //     if (reactionType === 'like') {
  //       this.addLikeBook(bookId);
  //     } else {
  //       this.removeLikeBook(bookId);
  //     }
  //   }
  // }

  }
