import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoryComponent } from './pages/history/history.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { AiAnalysisComponent } from './pages/ai-analysis/ai-analysis.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'ai-analysis', component: AiAnalysisComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
