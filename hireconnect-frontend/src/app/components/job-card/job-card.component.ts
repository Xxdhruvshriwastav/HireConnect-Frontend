import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="job-card">
      <div class="card-header">
        <div class="company-logo">
          <span class="material-symbols-outlined">corporate_fare</span>
        </div>
        <div class="header-info">
          <h3>{{ job.title }}</h3>
          <p class="category">{{ job.category }}</p>
        </div>
        <span class="status-chip" [class.open]="job.status === 'OPEN'">{{ job.status }}</span>
      </div>
      
      <div class="card-body">
        <div class="meta-row">
          <span class="meta-item">
            <span class="material-symbols-outlined">location_on</span>
            {{ job.location }}
          </span>
          <span class="meta-item">
            <span class="material-symbols-outlined">payments</span>
            ₹{{ job.salaryMin / 1000 }}k - ₹{{ job.salaryMax / 1000 }}k
          </span>
          <span class="meta-item">
            <span class="material-symbols-outlined">schedule</span>
            {{ job.type }}
          </span>
        </div>
        
        <div class="skills-row">
          <span class="skill-tag" *ngFor="let skill of job.skills">{{ skill }}</span>
        </div>
      </div>
      
      <div class="card-footer">
        <span class="posted-date">Posted {{ job.postedAt | date:'mediumDate' }}</span>
        <button class="btn-apply">View Details</button>
      </div>
    </div>
  `,
  styles: [`
    .job-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; transition: all 0.3s ease; cursor: pointer;
      &:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-color: #4f46e5; }
    }
    .card-header {
      display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.25rem;
      .company-logo { width: 48px; height: 48px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #4f46e5; }
      .header-info { flex: 1; h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.25rem; color: #1e293b; } .category { font-size: 0.85rem; color: #64748b; font-weight: 600; } }
      .status-chip { font-size: 0.7rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 100px; background: #f1f5f9; color: #64748b; &.open { background: #dcfce7; color: #166534; } }
    }
    .card-body {
      margin-bottom: 1.5rem;
      .meta-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; .meta-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #64748b; font-weight: 500; .material-symbols-outlined { font-size: 1.1rem; } } }
      .skills-row { display: flex; flex-wrap: wrap; gap: 0.5rem; .skill-tag { font-size: 0.75rem; background: #eef2ff; color: #4f46e5; padding: 0.3rem 0.75rem; border-radius: 8px; font-weight: 700; } }
    }
    .card-footer {
      display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; border-top: 1px solid #f1f5f9;
      .posted-date { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
      .btn-apply { background: #4f46e5; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: background 0.2s; &:hover { background: #4338ca; } }
    }
  `]
})
export class JobCardComponent {
  @Input() job!: Job;
}
