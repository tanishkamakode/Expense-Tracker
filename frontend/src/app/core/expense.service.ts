import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Expense {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  transaction_date: string;
  notes?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private expensesSignal = signal<Expense[]>([]);
  public loading = signal<boolean>(true);

  readonly expenses = this.expensesSignal.asReadonly();
  
  readonly totalBalance = computed(() => {
    return this.expensesSignal().reduce((acc, exp) => 
      exp.type === 'income' ? acc + Number(exp.amount) : acc - Number(exp.amount), 0);
  });

  readonly totalIncome = computed(() => {
    return this.expensesSignal()
      .filter(e => e.type === 'income')
      .reduce((acc, exp) => acc + Number(exp.amount), 0);
  });

  readonly totalExpense = computed(() => {
    return this.expensesSignal()
      .filter(e => e.type === 'expense')
      .reduce((acc, exp) => acc + Number(exp.amount), 0);
  });

  constructor() {
    this.refreshExpenses();
  }

  async refreshExpenses() {
    this.loading.set(true);
    try {
      const data: any = await firstValueFrom(this.http.get('http://localhost:3000/api/expenses'));
      this.expensesSignal.set(data);
    } catch (e) {
      console.error(e);
      this.expensesSignal.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async addTransaction(expense: Omit<Expense, 'id' | 'created_at'>) {
    try {
      const newExp: any = await firstValueFrom(this.http.post('http://localhost:3000/api/expenses', expense));
      this.expensesSignal.update(current => [newExp, ...current]);
    } catch (e) {
      console.error(e);
    }
  }

  async deleteTransaction(id: string) {
    try {
      await firstValueFrom(this.http.delete(`http://localhost:3000/api/expenses/${id}`));
      this.expensesSignal.update(current => current.filter(e => e.id !== id));
    } catch (e) {
      console.error(e);
    }
  }
}
