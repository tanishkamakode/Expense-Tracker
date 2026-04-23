import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  
  currentUser = signal<{id: string, name: string, email: string} | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('expense_user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response: any = await firstValueFrom(
        this.http.post('http://localhost:3000/api/auth/login', { email, password })
      );
      this.currentUser.set(response.user);
      localStorage.setItem('expense_jwt', response.token);
      localStorage.setItem('expense_user', JSON.stringify(response.user));
      this.router.navigate(['/dashboard']);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async signup(name: string, email: string, password: string): Promise<boolean> {
    try {
      const response: any = await firstValueFrom(
        this.http.post('http://localhost:3000/api/auth/register', { name, email, password })
      );
      this.currentUser.set(response.user);
      localStorage.setItem('expense_jwt', response.token);
      localStorage.setItem('expense_user', JSON.stringify(response.user));
      this.router.navigate(['/dashboard']);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('expense_user');
    localStorage.removeItem('expense_jwt');
    this.router.navigate(['/login']);
  }
}

