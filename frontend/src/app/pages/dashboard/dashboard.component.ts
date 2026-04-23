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
  
  // Chart Instances
  chartInstance: Chart | null = null;
  incomeExpenseInstance: Chart | null = null;
  trendInstance: Chart | null = null;
  topCategoriesInstance: Chart | null = null;
  overspendingInstance: Chart | null = null;
  
  @ViewChild('expenseChart') expenseChartRef!: ElementRef;
  @ViewChild('incomeExpenseChart') incomeExpenseChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('topCategoriesChart') topCategoriesChartRef!: ElementRef;
  @ViewChild('overspendingChart') overspendingChartRef!: ElementRef;

  constructor() {
    effect(() => {
      const exps = this.expenseService.expenses();
      const loading = this.expenseService.loading();
      
      if (!loading && exps.length > 0) {
        // Use setTimeout to wait for *ngIf to render the canvases in the DOM
        setTimeout(() => {
          if (!this.chartInstance) {
            this.initChart();
          } else {
            this.updateChart(exps);
          }
        }, 0);
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
    if (this.chartInstance) this.chartInstance.destroy();
    if (this.incomeExpenseInstance) this.incomeExpenseInstance.destroy();
    if (this.trendInstance) this.trendInstance.destroy();
    if (this.topCategoriesInstance) this.topCategoriesInstance.destroy();
    if (this.overspendingInstance) this.overspendingInstance.destroy();
  }

  initChart() {
    if (!this.expenseChartRef || !this.incomeExpenseChartRef || !this.trendChartRef || !this.topCategoriesChartRef || !this.overspendingChartRef) return;
    
    // 1. Expense Distribution (Donut)
    this.chartInstance = new Chart(this.expenseChartRef.nativeElement, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'], hoverOffset: 4, borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } } }
    });

    // 2. Income vs Expense (Bar)
    this.incomeExpenseInstance = new Chart(this.incomeExpenseChartRef.nativeElement, {
      type: 'bar',
      data: { labels: ['Income', 'Expense'], datasets: [{ label: 'Amount', data: [0, 0], backgroundColor: ['#10b981', '#ef4444'], borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
    });

    // 3. Monthly Trend (Line)
    this.trendInstance = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Expense', data: [], borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.1)', fill: true, tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } } } }
    });

    // 4. Top Spending Categories (Horizontal Bar)
    this.topCategoriesInstance = new Chart(this.topCategoriesChartRef.nativeElement, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Expense', data: [], backgroundColor: '#4f46e5', borderRadius: 6 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, y: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
    });

    // 5. Overspending Indicator (Budget Tracker)
    this.overspendingInstance = new Chart(this.overspendingChartRef.nativeElement, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Spending', data: [], backgroundColor: [], borderRadius: 6 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { max: 20000, beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, y: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
    });

    this.updateChart(this.expenseService.expenses());
  }

  updateChart(expenses: any[]) {
    if (!this.chartInstance || !this.incomeExpenseInstance || !this.trendInstance || !this.topCategoriesInstance || !this.overspendingInstance) return;
    
    // Group by category for expenses
    const expOnly = expenses.filter(e => e.type === 'expense');
    const incomeOnly = expenses.filter(e => e.type === 'income');

    const categoryTotals = expOnly.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);

    // 1. Donut
    this.chartInstance.data.labels = Object.keys(categoryTotals);
    this.chartInstance.data.datasets[0].data = Object.values(categoryTotals) as number[];
    this.chartInstance.update();

    // 2. Income vs Expense
    const totalInc = incomeOnly.reduce((a, b) => a + Number(b.amount), 0);
    const totalExp = expOnly.reduce((a, b) => a + Number(b.amount), 0);
    this.incomeExpenseInstance.data.datasets[0].data = [totalInc, totalExp] as number[];
    this.incomeExpenseInstance.update();

    // 3. Monthly Trend
    const monthlyData = expOnly.reduce((acc, curr) => {
      const month = curr.transaction_date.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);
    
    const sortedMonths = Object.keys(monthlyData).sort();
    this.trendInstance.data.labels = sortedMonths;
    this.trendInstance.data.datasets[0].data = sortedMonths.map(m => Number(monthlyData[m]));
    this.trendInstance.update();

    // 4. Top Categories
    const sortedCats = Object.entries(categoryTotals).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 5);
    this.topCategoriesInstance.data.labels = sortedCats.map(c => c[0]);
    this.topCategoriesInstance.data.datasets[0].data = sortedCats.map(c => Number(c[1]));
    this.topCategoriesInstance.update();

    // 5. Overspending Indicator
    // Budget is mocked at 20,000 per category. Red if > 20000, Blue otherwise.
    this.overspendingInstance.data.labels = sortedCats.map(c => c[0]);
    this.overspendingInstance.data.datasets[0].data = sortedCats.map(c => Number(c[1]));
    this.overspendingInstance.data.datasets[0].backgroundColor = sortedCats.map(c => Number(c[1]) > 20000 ? '#ef4444' : '#3b82f6') as any;
    this.overspendingInstance.update();
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
