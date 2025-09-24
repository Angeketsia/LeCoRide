import { Injectable } from "@angular/core";

const ACCESS_TOKEN_KEY = "app_access_token";
const REFRESH_TOKEN_KEY = "app_refresh_token";

@Injectable({
  providedIn: "root",
})
export class TokenService {

  private accessToken: string | null = null;

  // true = backend utilise cookies HttpOnly pour refresh et on ne le stocke pas cote client
  // public readonly useHttpOnlyRefreshCookie = true;
  public  useHttpOnlyRefreshCookie = true;

  constructor() {
    const saved = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (saved) {
      this.accessToken = saved;
    }
  }

  // utilise pour ajouter l'authorisation
  getAccessToken(): string | null {
    return this.accessToken;
  }


  // le persist me permet de sauvegarder dans le localStorage egalement
  setAccessToken(token: string | null, persist = false) {
    this.accessToken = token;
    if (persist && token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  getRefreshToken(): string | null {
    return this.useHttpOnlyRefreshCookie ? null : localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string | null) {
    if (this.useHttpOnlyRefreshCookie) {
      //  le serveur doit set cookie HttpOnly
      return;
    }
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  clear() {
    this.accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
