

import { BookService } from '../services/book.service';
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable()

export class BooksListResolver implements Resolve<Book[]>{
  constructor(private BookService: BookService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Book[]>{
    return this.BookService.getAll();
  }
}
