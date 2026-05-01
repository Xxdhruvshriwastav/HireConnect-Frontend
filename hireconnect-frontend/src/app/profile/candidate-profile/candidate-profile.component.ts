import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../profile.service';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss']
})
export class CandidateProfileComponent implements OnInit {
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
      mobile: [''],
      experience: [''],
      resumeUrl: [''],
      profilePictureUrl: [''],
      coverPictureUrl: [''],
      summary: [''],
      skills: this.fb.array([]),
      education: this.fb.array([]),
      workExperience: this.fb.array([])
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

  get skills() { return this.profileForm.get('skills') as FormArray; }
  get education() { return this.profileForm.get('education') as FormArray; }
  get workExperience() { return this.profileForm.get('workExperience') as FormArray; }

  addSkill(skill: string = '') {
    this.skills.push(this.fb.control(skill));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  addEducation(edu: any = { degree: '', school: '', period: '', honor: '' }) {
    this.education.push(this.fb.group({
      degree: [edu.degree],
      school: [edu.school],
      period: [edu.period],
      honor: [edu.honor]
    }));
  }

  removeEducation(index: number) {
    this.education.removeAt(index);
  }

  addWorkExperience(exp: any = { title: '', company: '', period: '', description: '' }) {
    this.workExperience.push(this.fb.group({
      title: [exp.title],
      company: [exp.company],
      period: [exp.period],
      description: [exp.description]
    }));
  }

  removeWorkExperience(index: number) {
    this.workExperience.removeAt(index);
  }

  loadProfile() {
    if (!this.email) {
      this.isNewProfile = true;
      this.isEditing = true; // Auto-open form for new profile
      return;
    }
    this.profileService.getProfile(this.email).subscribe({
      next: (profile) => {
        this.isNewProfile = false;
        this.profileForm.patchValue({
          fullName: profile.fullName,
          mobile: profile.mobile,
          experience: profile.experience,
          resumeUrl: profile.resumeUrl,
          profilePictureUrl: profile.profilePictureUrl || '',
          coverPictureUrl: profile.coverPictureUrl || '',
          summary: profile.summary || ''
        });
        // Clear then repopulate arrays to avoid duplicates on re-load
        while (this.skills.length) this.skills.removeAt(0);
        while (this.education.length) this.education.removeAt(0);
        while (this.workExperience.length) this.workExperience.removeAt(0);

        if (profile.skills) {
          profile.skills.forEach((s: string) => this.addSkill(s));
        }
        if (profile.education) {
          profile.education.forEach((e: any) => this.addEducation(e));
        }
        if (profile.workExperience) {
          profile.workExperience.forEach((w: any) => this.addWorkExperience(w));
        }
      },
      error: () => {
        this.isNewProfile = true;
        this.isEditing = true; // Auto-open form so user can fill it in
      }
    });
  }

  hasWorkExperience(): boolean {
    return this.workExperience.controls.some(control => control.get('title')?.value || control.get('company')?.value);
  }

  isUploading = false;
  isPicUploading = false;
  isCoverUploading = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.profileService.uploadFile(file).subscribe({
        next: (res) => {
          this.profileForm.patchValue({ resumeUrl: res.url });
          this.isUploading = false;
          this.successMessage = 'Resume uploaded successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isUploading = false;
          this.successMessage = '❌ Resume upload failed.';
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  onProfilePicSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isPicUploading = true;
      this.profileService.uploadFile(file).subscribe({
        next: (res) => {
          const newPicUrl = res.url;
          this.profileForm.patchValue({ profilePictureUrl: newPicUrl });
          this.isPicUploading = false;

          // Auto-save the new picture URL to the database immediately
          const profileData = {
            ...this.profileForm.getRawValue(),
            profilePictureUrl: newPicUrl,
            role: 'CANDIDATE'
          };

          if (this.isNewProfile) {
            // If no profile exists yet, create one
            this.profileService.createCandidateProfile(profileData).subscribe({
              next: () => {
                this.isNewProfile = false;
                this.successMessage = '✅ Profile picture saved!';
                setTimeout(() => this.successMessage = '', 3000);
              },
              error: () => {
                this.successMessage = 'Picture uploaded to cloud, but save failed. Click Save Profile to persist.';
                setTimeout(() => this.successMessage = '', 5000);
              }
            });
          } else {
            this.profileService.updateCandidateProfile(this.email, profileData).subscribe({
              next: () => {
                this.successMessage = '✅ Profile picture saved!';
                setTimeout(() => this.successMessage = '', 3000);
              },
              error: () => {
                this.successMessage = 'Picture uploaded to cloud, but save failed. Click Save Profile to persist.';
                setTimeout(() => this.successMessage = '', 5000);
              }
            });
          }
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isPicUploading = false;
          this.successMessage = '❌ Profile picture upload failed.';
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  onCoverPicSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isCoverUploading = true;
      this.profileService.uploadFile(file).subscribe({
        next: (res) => {
          const newCoverUrl = res.url;
          this.profileForm.patchValue({ coverPictureUrl: newCoverUrl });
          this.isCoverUploading = false;

          const profileData = {
            ...this.profileForm.getRawValue(),
            coverPictureUrl: newCoverUrl,
            role: 'CANDIDATE'
          };

          if (this.isNewProfile) {
            this.profileService.createCandidateProfile(profileData).subscribe({
              next: () => {
                this.isNewProfile = false;
                this.successMessage = '✅ Cover picture saved!';
                setTimeout(() => this.successMessage = '', 3000);
              },
              error: () => {
                this.successMessage = 'Picture uploaded to cloud, but save failed. Click Save Profile to persist.';
                setTimeout(() => this.successMessage = '', 5000);
              }
            });
          } else {
            this.profileService.updateCandidateProfile(this.email, profileData).subscribe({
              next: () => {
                this.successMessage = '✅ Cover picture saved!';
                setTimeout(() => this.successMessage = '', 3000);
              },
              error: () => {
                this.successMessage = 'Picture uploaded to cloud, but save failed. Click Save Profile to persist.';
                setTimeout(() => this.successMessage = '', 5000);
              }
            });
          }
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isCoverUploading = false;
          this.successMessage = '❌ Cover picture upload failed.';
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  hasEducation(): boolean {
    return this.education.controls.some(control => control.get('degree')?.value || control.get('school')?.value);
  }

  getBullets(text: string): string[] {
    if (!text) return [];
    // Split by newline or period followed by space
    return text.split(/(?:\r?\n|\.\s+)/).map(s => s.trim()).filter(s => s.length > 0);
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const profileData = { 
      ...this.profileForm.getRawValue(),
      role: 'CANDIDATE' // Required by backend UserProfile entity
    };

    if (this.isNewProfile) {
      this.profileService.createCandidateProfile(profileData).subscribe({
        next: (res) => {
          this.isNewProfile = false;
          this.isEditing = false;
          this.successMessage = 'Profile created successfully!';
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: (err) => {
          console.error('Error creating profile:', err);
          this.successMessage = '❌ Failed to create profile. Please try again.';
          setTimeout(() => this.successMessage = '', 5000);
        }
      });
    } else {
      this.profileService.updateCandidateProfile(this.email, profileData).subscribe({
        next: (res) => {
          this.isEditing = false;
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.successMessage = '❌ Failed to update profile. Please try again.';
          setTimeout(() => this.successMessage = '', 5000);
        }
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  getViewUrl(url: string | null | undefined): string {
    if (!url) return '';
    return url; // raw PDFs and images both open correctly via direct Cloudinary URL
  }

  getDownloadUrl(url: string | null | undefined): string {
    if (!url) return '';
    return url; // browser handles download natively for raw PDF URLs
  }

  logout() {
    localStorage.clear();
    window.location.href = '/auth/login';
  }
}
