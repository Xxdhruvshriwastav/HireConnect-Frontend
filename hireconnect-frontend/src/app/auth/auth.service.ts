import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // 🔐 LOGIN
  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          this.handleAuthResponse(res);
        })
      );
  }

  // 🌐 GOOGLE LOGIN
  googleLogin(idToken: string) {
    return this.http.post<any>(`${this.baseUrl}/google`, { idToken })
      .pipe(
        tap(res => {
          this.handleAuthResponse(res);
        })
      );
  }

  private handleAuthResponse(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('userId', res.userId);
    localStorage.setItem('email', res.email);
    const user = { id: res.userId, role: res.role, email: res.email };
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ✅ REGISTER
  registerCandidate(data: any) {
    return this.http.post<any>(`${this.baseUrl}/register/candidate`, data);
  }

  registerRecruiter(data: any) {
    return this.http.post<any>(`${this.baseUrl}/register/recruiter`, data);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  getCurrentUserEmail(): string | null {
    return localStorage.getItem('email');
  }

  redirectByRole() {
    const role = localStorage.getItem('role');

    if (role === 'RECRUITER') {
      this.router.navigate(['/dashboard']);
    } else if (role === 'CANDIDATE') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}