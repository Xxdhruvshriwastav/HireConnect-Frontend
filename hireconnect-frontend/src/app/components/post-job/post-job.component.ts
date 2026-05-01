import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.scss']
})
export class PostJobComponent implements OnInit {
  jobForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const recruiterEmail = this.authService.getCurrentUserEmail();
    
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      type: ['Full-time', Validators.required],
      location: ['', Validators.required],
      salaryMin: [0, [Validators.required, Validators.min(0)]],
      salaryMax: [0, [Validators.required, Validators.min(0)]],
      experienceRequired: ['', Validators.required],
      postedBy: [recruiterEmail],
      status: ['OPEN'],
      skills: this.fb.array([this.fb.control('')])
    });
  }

  get skills() {
    return this.jobForm.get('skills') as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.control(''));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  onSubmit() {
    if (this.jobForm.valid) {
      this.isSubmitting = true;
      const formValue = this.jobForm.value;
      const jobData = {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        location: formValue.location,
        type: formValue.type,
        experienceRequired: formValue.experienceRequired,
        salaryMin: Number(formValue.salaryMin) || 0,
        salaryMax: Number(formValue.salaryMax) || 0,
        skills: formValue.skills ? formValue.skills.filter((s: string) => s && s.trim() !== '') : [],
        postedBy: this.authService.getCurrentUserEmail() ?? '',
        status: 'OPEN' as const
      };

      console.log('Sending Job Data:', jobData);

      this.jobService.postJob(jobData).subscribe({
        next: (res) => {
          console.log('Job posted successfully', res);
          alert('Opportunity published successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error posting job', err);
          alert('Failed to publish opportunity. Please check the network or try again.');
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
