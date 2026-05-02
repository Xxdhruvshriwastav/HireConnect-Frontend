import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, AnalyticsSummary } from '../../services/analytics.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: AnalyticsSummary | null = null;
  isLoading = true;
  activeTab = 'analytics'; // 'analytics', 'users', 'jobs'

  users: any[] = [];
  jobs: any[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadStats();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'analytics') this.loadStats();
    if (tab === 'users') this.loadUsers();
    if (tab === 'jobs') this.loadJobs();
  }

  loadStats() {
    this.isLoading = true;
    this.analyticsService.getPlatformStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching platform stats', err);
        this.isLoading = false;
      }
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.isLoading = false;
      }
    });
  }

  suspendUser(id: number, suspend: boolean) {
    this.adminService.suspendUser(id, suspend).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Error suspending user', err)
    });
  }

  editUser(user: any) {
    const newRole = prompt('Enter new role (CANDIDATE, RECRUITER, ADMIN):', user.role);
    if (newRole && ['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(newRole.toUpperCase())) {
      const updatedUser = { ...user, role: newRole.toUpperCase() };
      this.adminService.updateUser(user.userId, updatedUser).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('Error updating user')
      });
    } else if (newRole) {
      alert('Invalid role');
    }
  }

  deleteUser(id: number) {
    if(confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error deleting user', err)
      });
    }
  }

  loadJobs() {
    this.isLoading = true;
    this.adminService.getAllJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching jobs', err);
        this.isLoading = false;
      }
    });
  }

  deleteJob(id: number) {
    if(confirm('Are you sure you want to delete this job?')) {
      this.adminService.deleteJob(id).subscribe({
        next: () => this.loadJobs(),
        error: (err) => console.error('Error deleting job', err)
      });
    }
  }

  logout() {
    this.authService.logout();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
