import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Application {
  applicationId?: number;
  jobId: number;
  candidateEmail: string;
  appliedAt?: string;
  status?: string;
  coverLetter: string;
  resumeUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:8080/api/v1/applications';

  constructor(private http: HttpClient) { }

  submitApplication(application: Application): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, application);
  }

  getApplicationsByCandidate(email: string): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/candidate/${email}`);
  }

  getApplicationsByJob(jobId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/job/${jobId}`);
  }

  updateStatus(id: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  withdrawApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getApplicationById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  getApplicationCount(jobId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/job/${jobId}`);
  }
}
