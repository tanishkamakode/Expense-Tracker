import { Component, ElementRef, OnInit, ViewChild, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../core/expense.service';
import { AuthService } from '../../core/auth.service';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TransactionModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  public expenseService = inject(ExpenseService);
  public authService = inject(AuthService);

  showAddModal = signal(false);
  chartInstance: Chart | null = null;
  
  @ViewChild('expenseChart') expenseChartRef!: ElementRef;

  constructor() {
    effect(() => {
      // Re-trigger chart rendering when expenses change
      const exps = this.expenseService.expenses();
      if (this.chartInstance) {
        this.updateChart(exps);
      }
    });
  }

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  initChart() {
    if (!this.expenseChartRef) return;
    
    this.chartInstance = new Chart(this.expenseChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
    this.updateChart(this.expenseService.expenses());
  }

  updateChart(expenses: any[]) {
    if (!this.chartInstance) return;
    
    // Group by category for expenses only
    const expOnly = expenses.filter(e => e.type === 'expense');
    const categoryTotals = expOnly.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    this.chartInstance.data.labels = Object.keys(categoryTotals);
    this.chartInstance.data.datasets[0].data = Object.values(categoryTotals);
    this.chartInstance.update();
  }

  openModal() {
    this.showAddModal.set(true);
  }

  closeModal() {
    this.showAddModal.set(false);
  }

  handleSaveTransaction(data: any) {
    this.expenseService.addTransaction(data);
    this.closeModal();
  }

  logout() {
    this.authService.logout();
  }
}
