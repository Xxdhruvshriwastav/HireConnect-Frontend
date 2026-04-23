import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  loading = false;
  mode: 'login' | 'signup' = 'login';

  constructor(private auth: AuthService, private ngZone: NgZone) {}

  ngOnInit() {
    // Wait for GIS script to load
    setTimeout(() => {
      this.initializeGoogleSignIn();
    }, 500);
  }

  private initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '947386209106-1c6jnd5kgg7va9p0cqr2pq1suh9j9emn.apps.googleusercontent.com',
        callback: this.handleGoogleCredentialResponse.bind(this)
      });
      
      const btnElement = document.getElementById('google-signin-btn');
      if (btnElement) {
        google.accounts.id.renderButton(btnElement, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular'
        });
      }
    } else {
      console.error('Google SDK not loaded');
    }
  }

  handleGoogleCredentialResponse(response: any) {
    console.log('Google Credential Response:', response);
    if (!response.credential) {
      console.error('No credential received from Google. Check Origin settings.');
      alert('Google authentication failed: No token received. Please check your Google Console "Origins" settings.');
      return;
    }
    this.loading = true;
    this.auth.googleLogin(response.credential).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.auth.redirectByRole();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.loading = false;
          console.error('Google Login Error:', err);
          const msg = err.error?.message || err.message || 'Unauthorized';
          alert('Google Login Failed: ' + msg);
        });
      }
    });
  }

  setMode(newMode: 'login' | 'signup') {
    this.mode = newMode;
  }

  onSubmit() {
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.auth.redirectByRole();
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;
        const errorMessage = err.error?.message || err.message || 'Login failed';
        alert(errorMessage);
      }
    });
  }
}