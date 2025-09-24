import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-otp-input',
  standalone: false,
  templateUrl: './otp-input-component.html',
  styleUrls: ['./otp-input-component.scss']
})
export class OtpInputComponentTs implements OnInit {

  // communique et renvoie le chiffre complet au parent
  @Output() codeCompleted = new EventEmitter<string>();
  @Input() disabled = false;
  @Input() error = false; //actif quand il y a une erreur

  otpForm!: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {

    // digits est un formArray de 6 formcontrol vides (tableau repetitif et j'accede a chaque input par son index)
  this.otpForm = this.fb.group({
    digits: this.fb.array(Array(6).fill('').map(() => new FormControl('')))
  });
  }

  // je recupere les 6 inputs du template html et les stocke dans otpInputs
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  // simplifie l'acces au formArray

  get digits() {
    return this.otpForm.get('digits') as FormArray;
  }

  onClear() {
    this.digits.reset();

    setTimeout(() => {
    if (this.otpInputs.first) {
      this.otpInputs.first.nativeElement.focus();
    }
  });
  }


  // pour avancer automatiquement au prochain input, garde le dernier caractere si le user colle plusieurs chiffres
  // met a jout le formArray, passe le focus a l'input sivant, verifie si le code est complet
  onInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // Ne garder que le dernier caractère
    if (value.length > 1) {
      input.value = value.charAt(value.length - 1);
    }

    this.digits.at(index).setValue(input.value);

    // Focus sur l'input suivant
    if (value && index < this.digits.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }

    this.checkCompletion();
  }

  // si le user rentre en arriere et que l'input est vide, revient a l'input precedent

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digits.at(index).value && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  // cas ou il colle directement le code
  // empeche le collage par defaut, verifie que le texte contient 6 chiffres
  // recupere chaque chiffre et l'ajoute au formArray et verifie si le code est complet

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') ?? '';
    if (/^\d{6}$/.test(pastedData)) {
      pastedData.split('').forEach((char, i) => {
        this.digits.at(i).setValue(char);
        this.otpInputs.toArray()[i].nativeElement.value = char;
      });
      this.checkCompletion();
    }
  }

  // rassemble les 6 chiffres en une seule chaine
  // emet l'evenement vers le parent
  private checkCompletion() {
    const code = this.digits.value.join('');
    if (code.length === 6) {
      this.codeCompleted.emit(code);
    }
  }
}
