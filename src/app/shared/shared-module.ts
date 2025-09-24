import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShortenPipe } from './pipes/shorten.pipe';
import { UsernamePipe } from './pipes/username.pipe';
import { TimeAgoPipe } from './pipes/timeAgo.pipe';
import { HighlightDirective } from './directives/highlight.directive';
import { TranslateModule } from '@ngx-translate/core';
import { OtpInputComponentTs } from './components/otp-input-component/otp-input-component';
import { CountdownTimerComponentTs } from './components/countdown-timer-component/countdown-timer-component';
import { TranslateService } from '@ngx-translate/core';



@NgModule({
  declarations: [
    ShortenPipe,
    UsernamePipe,
    TimeAgoPipe,
    HighlightDirective,
    OtpInputComponentTs,
    CountdownTimerComponentTs

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
    ShortenPipe,
    UsernamePipe,
    TimeAgoPipe,
    HighlightDirective,
    ReactiveFormsModule,
    TranslateModule,
     OtpInputComponentTs,
    CountdownTimerComponentTs,
    FormsModule

  ]
})
export class SharedModule { }
