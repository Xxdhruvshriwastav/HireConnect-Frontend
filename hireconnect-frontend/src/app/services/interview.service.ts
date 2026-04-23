import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Interview {
  interviewId?: number;
  applicationId: number;
  scheduledAt: string; // ISO Date String
  mode: string;
  meetLink?: string;
  location?: string;
  status?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private baseUrl = 'http://localhost:8080/api/v1/interviews';

  constructor(private http: HttpClient) {}

  scheduleInterview(interview: Interview): Observable<Interview> {
    return this.http.post<Interview>(`${this.baseUrl}/schedule`, interview);
  }

  confirmInterview(interviewId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${interviewId}/confirm`, {}, { responseType: 'text' });
  }

  rescheduleInterview(interviewId: number, newScheduledAt: string): Observable<Interview> {
    return this.http.put<Interview>(`${this.baseUrl}/${interviewId}/reschedule?newScheduledAt=${newScheduledAt}`, {});
  }

  cancelInterview(interviewId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${interviewId}/cancel`);
  }

  getInterviewsByApplication(applicationId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.baseUrl}/application/${applicationId}`);
  }
}
