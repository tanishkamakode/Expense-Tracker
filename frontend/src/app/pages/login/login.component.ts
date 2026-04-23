import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  isLoginMode = signal(true);
  loginError = signal(false);

  authForm = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode() {
    this.isLoginMode.update(v => !v);
    this.authForm.reset();
    this.loginError.set(false);
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    this.loginError.set(false);
    const { name, email, password } = this.authForm.value;

    let success = false;
    try {
      if (this.isLoginMode()) {
        success = await this.auth.login(email!, password!);
      } else {
        success = await this.auth.signup(name || 'Unknown', email!, password!);
      }
    } catch (e) {
      success = false;
    }

    if (!success) {
      this.loginError.set(true);
    }
  }
}
