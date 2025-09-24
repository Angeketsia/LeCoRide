import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CountdownTimerComponentTs } from './countdown-timer-component';
import { By } from '@angular/platform-browser';

describe('CountdownTimerComponentTs', () => {
  let component: CountdownTimerComponentTs;
  let fixture: ComponentFixture<CountdownTimerComponentTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CountdownTimerComponentTs]
    }).compileComponents();

    fixture = TestBed.createComponent(CountdownTimerComponentTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.duration).toBe(30);
  });

  it('should start timer and decrement remaining', fakeAsync(() => {
    component.duration = 5;
    component.startTimer();
    expect(component.remaining).toBe(5);

    tick(1000);
    expect(component.remaining).toBe(4);

    tick(2000);
    expect(component.remaining).toBe(2);

    tick(2000); // total 5s
    expect(component.remaining).toBe(0);
  }));

  it('should emit finished when timer reaches 0', fakeAsync(() => {
    spyOn(component.finished, 'emit');

    component.duration = 3;
    component.startTimer();

    tick(3000);
    expect(component.remaining).toBe(0);
    expect(component.finished.emit).toHaveBeenCalled();
  }));

  it('should reset timer', fakeAsync(() => {
    component.duration = 10;
    component.startTimer();
    tick(5000);
    expect(component.remaining).toBe(5);

    component.resetTimer();
    expect(component.remaining).toBe(10);
  }));

  it('should format time correctly', () => {
    component.duration = 125; // 2 min 5 sec
    component.remaining = 125;
    expect(component.formattedTime).toBe('2:05');

    component.remaining = 59;
    expect(component.formattedTime).toBe('0:59');

    component.remaining = 9;
    expect(component.formattedTime).toBe('0:09');
  });

  it('should unsubscribe on destroy', () => {
    component.startTimer();
    spyOn(component['sub'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['sub'].unsubscribe).toHaveBeenCalled();
  });
});
