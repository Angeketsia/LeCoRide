import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer-component.html',
  styleUrls: ['./countdown-timer-component.scss']
})
export class CountdownTimerComponentTs implements OnDestroy {
  @Input() duration = 30; // durée en secondes
  @Output() finished = new EventEmitter<void>();

  remaining!: number;
  private sub!: Subscription;

  // NE PAS démarrer automatiquement
  startTimer() {
    this.remaining = this.duration;
    this.sub?.unsubscribe();
    this.sub = interval(1000).subscribe(() => {
      this.remaining--;
      if (this.remaining <= 0) {
        this.sub.unsubscribe();
        this.finished.emit();
      }
    });
  }


  resetTimer() {
    this.sub?.unsubscribe();
    this.remaining = this.duration;
  }
  get formattedTime(): string {
    const minutes = Math.floor(this.remaining / 60);
    const seconds = this.remaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  stopTimer() {
  this.sub?.unsubscribe();
}

}
