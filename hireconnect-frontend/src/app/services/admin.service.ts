import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private userApi = 'http://localhost:8080/api/v1/auth/admin/users';
  private jobApi = 'http://localhost:8080/api/v1/jobs'; // Jobs might go through Gateway, assuming 8080 or job service port

  constructor(private http: HttpClient) {}

  // Get auth headers
  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ---- Manage Users ----
  getAllUsers() {
    return this.http.get<any[]>(this.userApi, { headers: this.getHeaders() });
  }

  suspendUser(id: number, suspend: boolean) {
    return this.http.put(`${this.userApi}/${id}/suspend?suspend=${suspend}`, {}, { headers: this.getHeaders() });
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.userApi}/${id}`, { headers: this.getHeaders() });
  }

  updateUser(id: number, data: any) {
    return this.http.put(`${this.userApi}/${id}`, data, { headers: this.getHeaders() });
  }

  // ---- Manage Jobs ----
  getAllJobs() {
    // Assuming API Gateway routes /api/v1/jobs or it's on a different port. We'll try 8080 first
    return this.http.get<any[]>(this.jobApi, { headers: this.getHeaders() });
  }

  deleteJob(id: number) {
    return this.http.delete(`${this.jobApi}/${id}`, { headers: this.getHeaders() });
  }
}
