// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { TriggerFormComponent } from './components/trigger-form/trigger-form.component';
import { TriggerWizardComponent } from './components/trigger-wizard/trigger-wizard.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportComponent } from './components/report/report.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'form', component: TriggerFormComponent },
  { path: 'wizard', component: TriggerWizardComponent },
  { path: 'report', component: ReportComponent },
  { path: '**', redirectTo: '/dashboard' }
];
