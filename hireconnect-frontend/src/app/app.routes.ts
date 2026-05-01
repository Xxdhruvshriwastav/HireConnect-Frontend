import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 🏠 HOME (Public Job Browsing)
  {
    path: 'home',
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  // 🔐 LOGIN
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // 📝 REGISTER
  { 
    path: 'auth/register/candidate', 
    loadComponent: () => import('./auth/candidate-register/candidate-register.component').then(m => m.CandidateRegisterComponent) 
  },
  { 
    path: 'auth/register/recruiter', 
    loadComponent: () => import('./auth/recruiter-register/recruiter-register.component').then(m => m.RecruiterRegisterComponent) 
  },
  { 
    path: 'auth/register/admin', 
    loadComponent: () => import('./auth/admin-register/admin-register.component').then(m => m.AdminRegisterComponent) 
  },

  // 🎯 DASHBOARD (Protected)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // 👤 PROFILE
  {
    path: 'candidate/profile',
    loadComponent: () =>
      import('./profile/candidate-profile/candidate-profile.component')
        .then(m => m.CandidateProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recruiter/profile',
    loadComponent: () =>
      import('./profile/recruiter-profile/recruiter-profile.component')
        .then(m => m.RecruiterProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recruiter/post-job',
    loadComponent: () =>
      import('./components/post-job/post-job.component')
        .then(m => m.PostJobComponent),
    canActivate: [authGuard]
  },
  {
    path: 'candidate/apply/:jobId',
    loadComponent: () =>
      import('./components/apply-job/apply-job.component')
        .then(m => m.ApplyJobComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/manage-subscription',
    loadComponent: () =>
      import('./dashboard/manage-subscription/manage-subscription.component')
        .then(m => m.ManageSubscriptionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./dashboard/admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  }
];
