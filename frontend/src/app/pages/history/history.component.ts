import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense } from '../../core/expense.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  expenseService = inject(ExpenseService);

  searchTerm = signal('');
  typeFilter = signal<'all' | 'income' | 'expense'>('all');
  
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

  deleteTx(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.expenseService.deleteTransaction(id);
    }
  }
}
