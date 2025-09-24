// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { App } from './app';
import { CoreModule } from './core/core-module';
import { SharedModule } from './shared/shared-module';
import { routes } from './app.routes';
import { AuthModule } from './auth/auth.module';
// Import ngx-translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/interceptors/auth.interceptor';
// Factory pour charger les fichiers JSON de traduction
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader();
}
@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    CoreModule,
    SharedModule,
    AuthModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient, TRANSLATE_HTTP_LOADER_CONFIG]
      }
    })
  ],
  providers: [
     {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './i18n/',
        suffix: '.json'
      }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule {}
