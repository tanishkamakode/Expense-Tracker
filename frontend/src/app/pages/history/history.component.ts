import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense } from '../../core/expense.service';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TransactionModalComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  expenseService = inject(ExpenseService);

  searchTerm = signal('');
  typeFilter = signal<'all' | 'income' | 'expense'>('all');
  editingTx = signal<Expense | null>(null);
  
  filteredExpenses = computed(() => {
    let list = this.expenseService.expenses();
    const term = this.searchTerm().toLowerCase();
    const type = this.typeFilter();

    if (term) {
      list = list.filter(e => e.category.toLowerCase().includes(term) || (e.notes && e.notes.toLowerCase().includes(term)));
    }
    
    if (type !== 'all') {
      list = list.filter(e => e.type === type);
    }

    return list;
  });

  editTx(tx: Expense) {
    this.editingTx.set(tx);
  }

  closeModal() {
    this.editingTx.set(null);
  }

  handleSaveTransaction(expenseData: any) {
    const tx = this.editingTx();
    if (tx) {
      this.expenseService.updateTransaction(tx.id, expenseData);
    }
    this.closeModal();
  }

  deleteTx(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.expenseService.deleteTransaction(id);
    }
  }
}
