import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrPhone: ['', [Validators.required]],
      password: ['', Validators.required],
    });

    this.route.queryParams.subscribe(params => {
    const value = params['email'] || params['phone'] || params['value'];
      if (value) {
        this.loginForm.patchValue({ emailOrPhone: value });
      }
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { emailOrPhone, password } = this.loginForm.value;
    this.authService.login(emailOrPhone, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || this.translate.instant('LOGIN.FAILED');
      }
    });
  }
}
