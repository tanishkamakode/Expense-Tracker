import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="modal-overlay animate-fade-in">
      <div class="modal-content card slide-up">
        <div class="flex justify-between items-center mb-4">
          <h2>{{ isEdit ? 'Edit Transaction' : 'Add Transaction' }}</h2>
          <button class="btn btn-icon btn-outline" style="width: 2rem; height: 2rem;" (click)="close.emit()">
            ✕
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="type-toggle flex gap-4">
            <button type="button" class="btn flex-1" [class.btn-primary]="form.value.type === 'expense'" [class.btn-outline]="form.value.type !== 'expense'" (click)="setType('expense')">Expense</button>
            <button type="button" class="btn flex-1" [class.btn-primary]="form.value.type === 'income'" [class.btn-outline]="form.value.type !== 'income'" style="background-color: var(--success-color); color: white;" *ngIf="form.value.type === 'income'" (click)="setType('income')">Income</button>
            <button type="button" class="btn btn-outline flex-1" *ngIf="form.value.type !== 'income'" (click)="setType('income')">Income</button>
          </div>

          <div class="form-group">
            <label>Amount</label>
            <input type="number" formControlName="amount" placeholder="0.00" min="0.01" step="0.01" />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select formControlName="category">
              <option value="" disabled>Select a category</option>
              <option *ngFor="let cat of getCategories()" [value]="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Date</label>
            <input type="date" formControlName="transaction_date" />
          </div>

          <div class="form-group">
            <label>Notes (Optional)</label>
            <textarea formControlName="notes" placeholder="Additional details"></textarea>
          </div>

          <div class="actions mt-4 flex justify-between gap-4">
            <button type="button" class="btn btn-outline flex-1" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn btn-primary flex-1" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      width: 100%;
      max-width: 450px;
    }
    .slide-up {
      animation: slideUp var(--transition-normal) forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .flex-1 { flex: 1; }
    .type-toggle .btn {
      transition: all var(--transition-fast);
    }
    .form-group {
      display: flex; flex-direction: column; gap: 0.4rem;
    }
    label { font-size: 0.9rem; font-weight: 500; }
  `]
})
export class TransactionModalComponent {
  private fb = inject(FormBuilder);

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEdit = false;

  @Input() set transaction(tx: any) {
    if (tx) {
      this.isEdit = true;
      this.form.patchValue({
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        transaction_date: tx.transaction_date.split('T')[0],
        notes: tx.notes || ''
      });
    }
  }

  form = this.fb.group({
    type: ['expense', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    transaction_date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['']
  });

  setType(type: 'income' | 'expense') {
    this.form.patchValue({ type, category: '' });
  }

  getCategories(): string[] {
    if (this.form.value.type === 'income') {
      return ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other Income'];
    }
    return ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Personal Care', 'Education', 'Travel', 'Other Expense'];
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}
