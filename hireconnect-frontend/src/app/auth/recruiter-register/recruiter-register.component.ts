import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-recruiter-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './recruiter-register.component.html',
  styleUrls: ['./recruiter-register.component.scss']
})
export class RecruiterRegisterComponent {

  // ✅ FIX (formData define karo)
  formData: any = {
    email: '',
    password: ''
  };

  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {

    this.loading = true;

    this.auth.registerRecruiter(this.formData).subscribe({
      next: (res: any) => {
        this.loading = false;

        alert(res.message || 'Recruiter registered successfully');
        this.router.navigate(['/auth/login']);
      },

      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        const errorMessage = err.error?.message || err.message || 'Registration failed';
        alert(errorMessage);
      }
    });
  }
}