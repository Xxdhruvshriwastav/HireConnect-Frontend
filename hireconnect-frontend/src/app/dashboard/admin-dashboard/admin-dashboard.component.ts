import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, AnalyticsSummary } from '../../services/analytics.service';
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

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
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

  logout() {
    this.authService.logout();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
