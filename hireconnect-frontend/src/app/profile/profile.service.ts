import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = 'http://localhost:8080/api/v1/profiles';

  constructor(private http: HttpClient) { }

  getProfile(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${email}`);
  }

  createCandidateProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/candidate`, profileData);
  }

  createRecruiterProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/recruiter`, profileData);
  }

  updateCandidateProfile(email: string, profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidate/${email}`, profileData);
  }

  updateRecruiterProfile(email: string, profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/recruiter/${email}`, profileData);
  }

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, formData);
  }
}
