import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Book } from '../models/book.model';
import { BookService } from '../services/book.service';

@Injectable({ providedIn: 'root' })
export class BookDetailResolver implements Resolve<Book | undefined> {
  constructor(private bookService: BookService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Book | undefined> {
    const id = Number(route.paramMap.get('id'));
    return this.bookService.getById(id).pipe(
      tap(book => {
        if (!book) {
          this.router.navigate(['/books']); // fallback si id invalide
        }
      })
    );
  }
}
