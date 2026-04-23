import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8080/api/v1/jobs';

  constructor(private http: HttpClient) { }

  postJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  getJobsByRecruiter(email: string): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/recruiter/${email}`);
  }

  searchJobs(title?: string, category?: string, location?: string): Observable<Job[]> {
    let params = '?';
    if (title) params += `title=${title}&`;
    if (category) params += `category=${category}&`;
    if (location) params += `location=${location}&`;
    return this.http.get<Job[]>(`${this.apiUrl}/search${params}`);
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
