import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsSummary {
  totalJobs: number;
  totalApplications: number;
  shortlistedCount: number;
  offeredCount: number;
  rejectedCount: number;
  avgTimeToHireDays: number;
  viewToApplyRatio: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api/v1/analytics';

  constructor(private http: HttpClient) { }

  getRecruiterStats(recruiterId: number): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.apiUrl}/recruiter/${recruiterId}`);
  }

  getPlatformStats(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.apiUrl}/admin`);
  }

  getJobViewCount(jobId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/job/${jobId}/view-count`);
  }
}
