import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { OtpInputComponent } from './otp-input-component';
import { ElementRef, QueryList } from '@angular/core';
import { SharedModule } from '../../shared-module';
  import { fakeAsync, tick } from '@angular/core/testing';

describe('OtpInputComponent', () => {
  let component: OtpInputComponent;
  let fixture: ComponentFixture<OtpInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtpInputComponent],
      imports: [ ReactiveFormsModule, SharedModule]
    }).compileComponents();

    fixture = TestBed.createComponent(OtpInputComponent);
    component = fixture.componentInstance;

    // Simuler les inputs pour QueryList
    const inputEls = Array(6).fill(null).map(() => {
      return { nativeElement: { value: '', focus: jasmine.createSpy('focus') } };
    });
    component.otpInputs = new QueryList<ElementRef>();
    (component.otpInputs as any)._results = inputEls;

    fixture.detectChanges();
  });

  it('should create and initialize FormArray', () => {
    expect(component).toBeTruthy();
    expect(component.digits.length).toBe(6);
    component.digits.controls.forEach(ctrl => expect(ctrl.value).toBe(''));
  });

  it('should update FormArray on input and move focus to next', () => {
    spyOn(component.codeCompleted, 'emit');

    // Saisie sur le premier input
    component.onInput({ target: { value: '5' } }, 0);
    expect(component.digits.at(0).value).toBe('5');
    const nextInput = component.otpInputs.toArray()[1].nativeElement;
    expect(nextInput.focus).toHaveBeenCalled();
    expect(component.codeCompleted.emit).not.toHaveBeenCalled();

    // Remplir tous les inputs
    ['1','2','3','4','5','6'].forEach((val, i) => {
      component.onInput({ target: { value: val } }, i);
    });
    expect(component.codeCompleted.emit).toHaveBeenCalledWith('123456');
  });

  it('should move focus to previous input on backspace', () => {
    const inputEls = component.otpInputs.toArray();
    component.digits.at(1).setValue('');
    component.onKeyDown({ key: 'Backspace' } as KeyboardEvent, 1);
    expect(inputEls[0].nativeElement.focus).toHaveBeenCalled();
  });

  it('should paste 6-digit code correctly and emit event', () => {
    spyOn(component.codeCompleted, 'emit');
    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      clipboardData: { getData: () => '654321' }
    } as any as ClipboardEvent;

    component.onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.digits.value.join('')).toBe('654321');
    expect(component.codeCompleted.emit).toHaveBeenCalledWith('654321');
  });


it('should clear all inputs and focus first input', fakeAsync(() => {
  const inputEls = component.otpInputs.toArray();

  // sécuriser focus en spy
  spyOn(inputEls[0].nativeElement, 'focus');

  component.digits.controls.forEach(ctrl => ctrl.setValue('1'));
  component.onClear();

  tick();

  component.digits.controls.forEach(ctrl => expect(ctrl.value ?? '').toBe(''));
  expect(inputEls[0].nativeElement.focus).toHaveBeenCalled();
}));


  it('should only keep last character if multiple characters are typed', () => {
  const inputEls = component.otpInputs.toArray();

  // sécuriser focus en spy
  spyOn(inputEls[1].nativeElement, 'focus');

  component.onInput({ target: { value: '12' } }, 0);

  expect(component.digits.at(0).value).toBe('2');
  expect(inputEls[1].nativeElement.focus).toHaveBeenCalled();
});


  it('should not emit codeCompleted if not all inputs are filled', () => {
    spyOn(component.codeCompleted, 'emit');
    ['1','2','3'].forEach((val, i) => component.onInput({ target: { value: val } }, i));
    expect(component.codeCompleted.emit).not.toHaveBeenCalled();
  });
});
