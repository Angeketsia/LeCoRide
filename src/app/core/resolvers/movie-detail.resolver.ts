import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { MovieService } from '../services/movie.service';

@Injectable({ providedIn: 'root' })
export class MovieDetailResolver implements Resolve<Movie | undefined> {
  constructor(private movieService: MovieService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Movie | undefined> {
    const id = Number(route.paramMap.get('id'));
    return this.movieService.getById(id).pipe(
      tap(movie => {
        if (!movie) {
          this.router.navigate(['/movies']);
        }
      })
    );
  }
}
