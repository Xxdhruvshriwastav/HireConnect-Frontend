import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../../profile/profile.service';

@Component({
  selector: 'app-apply-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.scss']
})
export class ApplyJobComponent implements OnInit {
  applyForm!: FormGroup;
  jobId!: number;
  isSubmitting = false;
  isUploading = false;
  uploadMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.jobId = +this.route.snapshot.params['jobId'];
    const email = this.authService.getCurrentUserEmail();

    this.applyForm = this.fb.group({
      jobId: [this.jobId],
      candidateEmail: [email, [Validators.required, Validators.email]],
      coverLetter: ['', [Validators.required, Validators.minLength(50)]],
      resumeUrl: ['', Validators.required]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.uploadMessage = 'Uploading...';
      this.profileService.uploadResume(file).subscribe({
        next: (url) => {
          this.applyForm.patchValue({ resumeUrl: url });
          this.isUploading = false;
          this.uploadMessage = '✅ Uploaded!';
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isUploading = false;
          this.uploadMessage = '❌ Failed';
        }
      });
    }
  }

  onSubmit() {
    if (this.applyForm.valid) {
      this.isSubmitting = true;
      this.applicationService.submitApplication(this.applyForm.value).subscribe({
        next: (res) => {
          alert('Application submitted successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error submitting application', err);
          alert(err.error?.message || 'Failed to submit application. You might have already applied.');
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
