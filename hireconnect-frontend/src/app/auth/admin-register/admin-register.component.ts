import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.scss']
})
export class AdminRegisterComponent {
  email = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.authService.register({ email: this.email, password: this.password }, 'ADMIN').subscribe({
      next: () => {
        alert('Admin account created successfully!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        const msg = err.error?.message || 'Registration failed. Please check if services are running.';
        alert(msg);
        this.loading = false;
      }
    });
  }
}
