import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from './directives/highlight.directive';
import { TranslateModule } from '@ngx-translate/core';
import { OtpInputComponent } from './components/otp-input-component/otp-input-component';
import { CountdownTimerComponent } from './components/countdown-timer-component/countdown-timer-component';



@NgModule({
  declarations: [
    HighlightDirective,
    OtpInputComponent,
    CountdownTimerComponent

  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule

  ],
  exports: [
    MaterialModule,
    HighlightDirective,
    ReactiveFormsModule,
    TranslateModule,
     OtpInputComponent,
    CountdownTimerComponent,
    FormsModule

  ]
})
export class SharedModule { }
