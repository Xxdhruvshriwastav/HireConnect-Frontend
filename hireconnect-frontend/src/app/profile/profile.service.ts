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

  uploadResume(file: File): Observable<string> {
    // Simulate a file upload delay and return a mock URL
    console.log('Uploading file:', file.name);
    const mockUrl = `https://hireconnect-storage.s3.amazonaws.com/resumes/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    return of(mockUrl).pipe(delay(1500));
  }
}
