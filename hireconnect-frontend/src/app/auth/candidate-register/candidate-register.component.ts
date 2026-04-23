import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-candidate-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './candidate-register.component.html',
  styleUrls: ['./candidate-register.component.scss']
})
export class CandidateRegisterComponent {

  formData: any = {
    email: '',
    password: ''
  };

  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;

    this.auth.registerCandidate(this.formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        alert(res.message || 'Registered successfully');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.loading = false;
        const errorMessage = err.error?.message || err.message || 'Registration failed';
        alert(errorMessage);
      }
    });
  }
}