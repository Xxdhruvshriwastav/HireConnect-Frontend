import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../profile.service';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recruiter-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recruiter-profile.component.html',
  styleUrls: ['./recruiter-profile.component.scss']
})
export class RecruiterProfileComponent implements OnInit {
  profileForm!: FormGroup;
  email: string = '';
  isNewProfile = true;
  successMessage = '';
  isEditing = false;
  activePlan = '';

  constructor(
    private fb: FormBuilder, 
    private profileService: ProfileService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  ngOnInit(): void {
    // Primary: read from localStorage (set during login)
    this.email = localStorage.getItem('userEmail') || localStorage.getItem('email') || '';
    // Fallback: decode JWT
    if (!this.email) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.email = payload.sub || payload.email || '';
        } catch (e) {
          this.email = '';
        }
      }
    }

    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{value: this.email, disabled: true}],
      companyName: ['', Validators.required],
      companySize: [''],
      industry: [''],
      website: ['']
    });

    this.loadProfile();
    this.fetchSubscription();
  }

  fetchSubscription() {
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      this.paymentService.getActiveSubscription(parseInt(userIdStr)).subscribe({
        next: (sub) => {
          if (sub && sub.status === 'ACTIVE') {
            this.activePlan = sub.plan;
          }
        }
      });
    }
  }

  onGlobalSearch(event: any) {
    if (event.key === 'Enter') {
      const query = event.target.value;
      this.router.navigate(['/dashboard'], { queryParams: { q: query } });
    }
  }

  loadProfile() {
    if (!this.email) {
      this.isNewProfile = true;
      this.isEditing = true; // Auto-open for new profile
      return;
    }
    this.profileService.getProfile(this.email).subscribe({
      next: (profile) => {
        this.isNewProfile = false;
        this.profileForm.patchValue({
          fullName: profile.fullName,
          companyName: profile.companyName,
          companySize: profile.companySize,
          industry: profile.industry,
          website: profile.website
        });
      },
      error: (err) => {
        console.error('Error loading recruiter profile:', err);
        this.isNewProfile = true;
        this.isEditing = true; // Auto-open form for new recruiters
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const profileData = { 
      ...this.profileForm.getRawValue(),
      role: 'RECRUITER' // Required by backend UserProfile entity
    };

    if (this.isNewProfile) {
      this.profileService.createRecruiterProfile(profileData).subscribe({
        next: (res) => {
          this.isNewProfile = false;
          this.isEditing = false;
          this.successMessage = 'Company Profile created successfully!';
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: (err) => {
          console.error('Error creating recruiter profile:', err);
          this.successMessage = '❌ Failed to create profile. Please try again.';
          setTimeout(() => this.successMessage = '', 5000);
        }
      });
    } else {
      this.profileService.updateRecruiterProfile(this.email, profileData).subscribe({
        next: (res) => {
          this.isEditing = false;
          this.successMessage = 'Company Profile updated successfully!';
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: (err) => {
          console.error('Error updating recruiter profile:', err);
          this.successMessage = '❌ Failed to update profile. Please try again.';
          setTimeout(() => this.successMessage = '', 5000);
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    window.location.href = '/auth/login';
  }
}
