

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from 'rxjs';
import { MovieService } from '../services/movie.service';
import { Movie } from "../models/movie.model";

@Injectable()

export class MoviesListResolver implements Resolve<Movie[]>{
  constructor(private MovieService: MovieService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Movie[]>{
    return this.MovieService.getAll();
  }
}
