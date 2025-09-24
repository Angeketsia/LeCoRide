import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared-module';
import { HeaderComponent } from './components/header.component/header.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class CoreModule { }
