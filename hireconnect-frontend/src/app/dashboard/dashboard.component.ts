import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { JobService } from '../services/job.service';
import { Job } from '../models/job.model';
import { ApplicationService, Application } from '../services/application.service';
import { InterviewService, Interview } from '../services/interview.service';
import { NotificationService, Notification } from '../services/notification.service';
import { PaymentService } from '../services/payment.service';
import { ProfileService } from '../profile/profile.service';
import { AnalyticsService, AnalyticsSummary } from '../services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  role: string | null = '';
  userEmail: string | null = '';
  jobs: Job[] = [];
  myJobs: Job[] = [];
  isLoading = true;
  isSidebarOpen = false;
  myApplications: Application[] = [];
  selectedJobApplications: Application[] = [];
  selectedJobId: number | null = null;
  recruiterStats: AnalyticsSummary | null = null;
  userProfile: any = null;
  
  // Interview Scheduling state
  schedulingApplicationId: number | null = null;
  interviewForm!: FormGroup;

  // Notifications state
  notifications: Notification[] = [];
  unreadCount = 0;
  isNotifPanelOpen = false;
  activePlan = '';

  // Search & Filter state
  searchQuery = '';
  filteredJobs: Job[] = [];
  filteredMyJobs: Job[] = [];
  visibleJobsCount = 6;

  get displayStats(): any {
    if (this.selectedJobId && this.selectedJobApplications) {
      const total = this.selectedJobApplications.length;
      const shortlisted = this.selectedJobApplications.filter(a => ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'CONFIRMED'].includes(a.status || '')).length;
      const ratio = total > 0 ? (total / (total * 2.5 + 5)) : 0.0;
      return {
        totalApplications: total,
        shortlistedCount: shortlisted,
        viewToApplyRatio: ratio,
        avgTimeToHireDays: total > 0 ? 12.5 : 0.0
      };
    }
    return this.recruiterStats;
  }

  get currentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  get displayedJobs(): Job[] {
    return this.filteredJobs.slice(0, this.visibleJobsCount);
  }

  loadMoreJobs() {
    this.visibleJobsCount += 6;
  }

  get greeting(): string {
    if (this.userEmail) {
      const namePart = this.userEmail.split('@')[0].split(/[._]/)[0];
      let capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      if (capitalized.length > 15) capitalized = capitalized.substring(0, 12) + '...';
      return `Welcome back, ${capitalized}`;
    }
    return 'Welcome back';
  }

  get profileStrength(): number {
    if (!this.userProfile) return 20;
    let score = 20;
    if (this.userProfile.fullName) score += 20;
    if (this.role === 'RECRUITER') {
      if (this.userProfile.companyName) score += 20;
      if (this.userProfile.website) score += 20;
      if (this.userProfile.industry) score += 20;
    } else {
      if (this.userProfile.workExperience && this.userProfile.workExperience.length > 0) score += 20;
      if (this.userProfile.resumeUrl) score += 20;
      if (this.userProfile.skills && this.userProfile.skills.length > 0) score += 20;
    }
    return score;
  }

  get isBasicInfoComplete(): boolean {
    if (this.role === 'RECRUITER') {
      return !!(this.userProfile?.fullName && this.userProfile?.companyName);
    }
    return !!(this.userProfile?.fullName && this.userProfile?.mobile);
  }

  get isWorkExperienceComplete(): boolean {
    if (this.role === 'RECRUITER') {
      return !!(this.userProfile?.industry);
    }
    return !!(this.userProfile?.workExperience && this.userProfile?.workExperience.length > 0) || !!(this.userProfile?.experience);
  }

  get isResumeUploaded(): boolean {
    if (this.role === 'RECRUITER') {
      return !!(this.userProfile?.website);
    }
    return !!(this.userProfile?.resumeUrl);
  }

  get isSkillsAdded(): boolean {
    if (this.role === 'RECRUITER') {
      return !!(this.userProfile?.summary); // For recruiters, summary can be company description
    }
    return !!(this.userProfile?.skills && this.userProfile?.skills.length > 0);
  }

  get isProfileFullyComplete(): boolean {
    return this.isBasicInfoComplete && this.isWorkExperienceComplete && this.isResumeUploaded && this.isSkillsAdded;
  }

  // Filter panel
  isFilterOpen = false;
  filterCategory = '';
  filterLocation = '';
  filterType = '';
  filterMinSalary: number | null = null;
  filterMaxSalary: number | null = null;
  filterExperience = '';
  activeFilterCount = 0;

  // Unique values for filter dropdowns
  categories: string[] = [];
  locations: string[] = [];
  jobTypes: string[] = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'];
  experienceLevels: string[] = ['Fresher', '1-2 Years', '3-5 Years', '5-10 Years', '10+ Years'];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private notificationService: NotificationService,
    private paymentService: PaymentService,
    private analyticsService: AnalyticsService,
    private profileService: ProfileService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.role = localStorage.getItem('role');
    this.userEmail = this.authService.getCurrentUserEmail();

    if (this.userEmail) {
      this.profileService.getProfile(this.userEmail).subscribe({
        next: (profile: any) => this.userProfile = profile,
        error: (err: any) => console.error('Error fetching profile', err)
      });
    }

    this.loadJobs();
    if (this.role === 'RECRUITER' && this.userEmail) {
      this.loadRecruiterStats();
    }
    if (this.role === 'CANDIDATE' && this.userEmail) {
      this.loadMyApplications();
    }
    this.loadNotifications();
    this.fetchActiveSubscription();

    // ✅ KEY FIX: Reload jobs every time the user navigates back to the dashboard
    // This fixes the issue where jobs posted via post-job form didn't appear
    // because Angular reuses the component instance and does not call ngOnInit again.
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects.startsWith('/dashboard')) {
        console.log('Dashboard navigated to — refreshing jobs...');
        this.loadJobs();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.applyFilters();
      }
    });
    
    this.interviewForm = this.fb.group({
      scheduledAt: ['', Validators.required],
      mode: ['Online', Validators.required],
      meetLink: [''],
      location: [''],
      notes: ['']
    });
  }

  refreshJobs() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading = true;
    // If user is CANDIDATE or GUEST (no role), show all jobs
    if (this.role === 'CANDIDATE' || !this.role) {
      this.jobService.getAllJobs().subscribe({
        next: (data) => {
          this.jobs = data;
          // Extract unique categories and combine with common ones for better UI
          const commonCategories = ['Engineering', 'Sales', 'Marketing', 'Product', 'Design', 'HR', 'Finance', 'Customer Support'];
          const dynamicCategories = data.map(j => j.category).filter(Boolean);
          this.categories = [...new Set([...commonCategories, ...dynamicCategories])].sort();
          this.locations = [...new Set(data.map(j => j.location).filter(Boolean))];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching jobs', err);
          this.isLoading = false;
        }
      });
    } else if (this.role === 'RECRUITER') {
      if (this.userEmail) {
        this.jobService.getJobsByRecruiter(this.userEmail).subscribe({
          next: (data) => {
            console.log(`Successfully fetched ${data.length} jobs for recruiter: ${this.userEmail}`);
            this.myJobs = data;
            this.applyFilters();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching my jobs', err);
            this.isLoading = false;
          }
        });
      } else {
        console.warn('Recruiter email is missing from session');
        this.isLoading = false;
      }
    }
  }

  loadRecruiterStats() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.analyticsService.getRecruiterStats(parseInt(userId)).subscribe({
        next: (stats) => this.recruiterStats = stats,
        error: (err) => console.error('Error loading recruiter stats', err)
      });
    }
  }

  goToPostJob() {
    this.router.navigate(['/recruiter/post-job']);
  }

  goToProfile() {
    if (!this.role) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.role === 'CANDIDATE') {
      this.router.navigate(['/candidate/profile']);
    } else if (this.role === 'RECRUITER') {
      this.router.navigate(['/recruiter/profile']);
    }
  }

  selectCategory(cat: string) {
    this.filterCategory = cat;
    this.applyFilters();
  }

  // ---- SEARCH ----
  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  // ---- FILTER PANEL TOGGLE ----
  toggleFilterPanel() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  // ---- APPLY ALL FILTERS (search + dropdowns) ----
  applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();

    if (this.role === 'CANDIDATE' || !this.role) {
      this.filteredJobs = this.jobs.filter(job => {
        const matchesSearch = !q || 
          job.title.toLowerCase().includes(q) || 
          job.company?.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.category.toLowerCase().includes(q);

        const matchesCategory = !this.filterCategory || job.category === this.filterCategory;
        const matchesLocation = !this.filterLocation || job.location === this.filterLocation;
        const matchesType = !this.filterType || (job.type && job.type.toLowerCase() === this.filterType.toLowerCase());
        const matchesMinSalary = !this.filterMinSalary || (job.salaryMin != null && job.salaryMin >= this.filterMinSalary);
        const matchesMaxSalary = !this.filterMaxSalary || (job.salaryMax != null && job.salaryMax <= this.filterMaxSalary);
        const matchesExperience = !this.filterExperience || job.experienceRequired === this.filterExperience;

        return matchesSearch && matchesCategory && matchesLocation && matchesType && matchesMinSalary && matchesMaxSalary && matchesExperience;
      });
    } else if (this.role === 'RECRUITER') {
      this.filteredMyJobs = this.myJobs.filter(job => {
        const matchesSearch = !q ||
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          (job.category && job.category.toLowerCase().includes(q));
        
        const matchesType = !this.filterType || (job.type && job.type.toLowerCase() === this.filterType.toLowerCase());
        return matchesSearch && matchesType;
      });
    }

    this.visibleJobsCount = 6;
    this.countActiveFilters();
  }

  countActiveFilters() {
    let count = 0;
    if (this.filterCategory) count++;
    if (this.filterLocation) count++;
    if (this.filterType) count++;
    if (this.filterMinSalary) count++;
    if (this.filterMaxSalary) count++;
    if (this.filterExperience) count++;
    this.activeFilterCount = count;
  }

  clearFilters() {
    this.filterCategory = '';
    this.filterLocation = '';
    this.filterType = '';
    this.filterMinSalary = null;
    this.filterMaxSalary = null;
    this.filterExperience = '';
    this.searchQuery = '';
    this.activeFilterCount = 0;
    this.applyFilters();
  }

  fetchActiveSubscription() {
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

  // Candidate interviews mapping
  candidateInterviews: { [appId: number]: Interview } = {};

  loadMyApplications() {
    if (this.userEmail) {
      this.applicationService.getApplicationsByCandidate(this.userEmail).subscribe({
        next: (data) => {
          this.myApplications = data.filter(app => app.status !== 'WITHDRAWN');
          this.loadInterviewsForApplications();
        },
        error: (err) => console.error('Error fetching applications', err)
      });
    }
  }

  loadInterviewsForApplications() {
    this.myApplications.forEach(app => {
      if (app.applicationId) {
        this.interviewService.getInterviewsByApplication(app.applicationId).subscribe({
          next: (interviews) => {
            if (interviews && interviews.length > 0) {
              this.candidateInterviews[app.applicationId!] = interviews[interviews.length - 1];
            }
          },
          error: (err) => console.error('Error fetching interview for app', app.applicationId, err)
        });
      }
    });
  }

  // Recruiter interviews mapping
  recruiterInterviews: { [appId: number]: Interview } = {};

  // ---- RECRUITER SCHEDULING ----
  openScheduleModal(appId: number | undefined) {
    if (!appId) return;
    this.schedulingApplicationId = appId;
    
    const existingInterview = this.recruiterInterviews[appId];
    if (existingInterview) {
      let formattedDate = '';
      if (existingInterview.scheduledAt) {
        const d = new Date(existingInterview.scheduledAt);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        formattedDate = d.toISOString().slice(0, 16);
      }
      this.interviewForm.patchValue({
        scheduledAt: formattedDate,
        mode: existingInterview.mode,
        meetLink: existingInterview.meetLink,
        location: existingInterview.location,
        notes: existingInterview.notes
      });
    } else {
      this.interviewForm.reset({ mode: 'Online' });
    }
  }

  cancelSchedule() {
    this.schedulingApplicationId = null;
  }

  submitSchedule() {
    if (this.interviewForm.valid && this.schedulingApplicationId) {
      const interviewData: Interview = {
        ...this.interviewForm.value,
        applicationId: this.schedulingApplicationId
      };

      const existingInterview = this.recruiterInterviews[this.schedulingApplicationId];

      if (existingInterview && existingInterview.interviewId) {
        this.interviewService.rescheduleInterview(existingInterview.interviewId, interviewData.scheduledAt).subscribe({
          next: (res) => {
            alert('Interview rescheduled successfully!');
            this.sendSystemNotification(
              this.schedulingApplicationId!, 
              'Interview Rescheduled', 
              `Your interview has been rescheduled to ${interviewData.scheduledAt}`
            );
            this.loadInterviewsForRecruiter();
            this.schedulingApplicationId = null;
          },
          error: (err) => {
            console.error('Error rescheduling interview', err);
            alert('Failed to reschedule interview.');
          }
        });
      } else {
        this.interviewService.scheduleInterview(interviewData).subscribe({
          next: (res) => {
            alert('Interview scheduled successfully!');
            this.sendSystemNotification(
              this.schedulingApplicationId!, 
              'Interview Scheduled', 
              `An interview has been scheduled for you on ${interviewData.scheduledAt}`
            );
            this.updateApplicationStatus(this.schedulingApplicationId!, 'INTERVIEW_SCHEDULED');
            this.schedulingApplicationId = null;
          },
          error: (err) => {
            console.error('Error scheduling interview', err);
            alert('Failed to schedule interview.');
          }
        });
      }
    }
  }

  sendSystemNotification(appId: number, type: string, message: string) {
    const app = this.selectedJobApplications.find(a => a.applicationId === appId) || 
                this.myApplications.find(a => a.applicationId === appId);
    
    if (app && app.candidateEmail) {
      const notif: Notification = {
        userId: app.candidateEmail,
        type: type.includes('Interview') ? 'EMAIL' : 'INFO',
        message: message
      };
      this.notificationService.sendNotification(notif).subscribe({
        next: () => console.log('Notification sent to', app.candidateEmail),
        error: (err) => console.error('Error sending notification', err)
      });
    }
  }

  // ---- NOTIFICATION ACTIONS ----
  loadNotifications() {
    if (!this.userEmail) return;
    this.notificationService.getNotifications(this.userEmail).subscribe({
      next: (data) => {
        this.notifications = data;
        this.updateUnreadCount();
      }
    });
  }

  updateUnreadCount() {
    if (!this.userEmail) return;
    this.notificationService.getUnreadCount(this.userEmail).subscribe({
      next: (count) => this.unreadCount = count
    });
  }

  toggleNotifPanel() {
    this.isNotifPanelOpen = !this.isNotifPanelOpen;
    if (this.isFilterOpen) this.isFilterOpen = false;
    
    if (this.isNotifPanelOpen && this.userEmail) {
      this.notificationService.getNotifications(this.userEmail).subscribe({
        next: (data) => {
          this.notifications = data;
          this.unreadCount = data.filter(n => !n.isRead).length;
        },
        error: (err) => console.error('Notification fetch failed', err)
      });
    }
  }

  markAsRead(id: number | undefined) {
    if (!id) return;
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n.notificationId === id);
        if (notif) notif.isRead = true;
        this.updateUnreadCount();
      }
    });
  }

  markAllAsRead() {
    if (!this.userEmail) return;
    this.notificationService.markAllAsRead(this.userEmail).subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }

  deleteNotification(id: number | undefined, event: Event) {
    event.stopPropagation();
    if (!id) return;
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.notificationId !== id);
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error deleting notification', err)
    });
  }

  cancelInterview(appId: number | undefined) {
    if (!appId) return;
    const interview = this.recruiterInterviews[appId];
    if (interview && interview.interviewId && confirm('Are you sure you want to cancel this interview?')) {
      this.interviewService.cancelInterview(interview.interviewId).subscribe({
        next: () => {
          alert('Interview cancelled.');
          this.loadInterviewsForRecruiter();
          this.updateApplicationStatus(appId, 'APPLIED');
        },
        error: (err) => console.error('Error cancelling interview', err)
      });
    }
  }

  // ---- CANDIDATE INTERVIEW ACTIONS ----
  confirmInterview(interviewId: number | undefined) {
    if (!interviewId) return;
    this.interviewService.confirmInterview(interviewId).subscribe({
      next: () => {
        alert('Interview confirmed!');
        this.loadInterviewsForApplications();
      },
      error: (err) => console.error('Error confirming interview', err)
    });
  }

  viewApplicants(jobId: number | undefined) {
    if (!jobId) return;
    this.selectedJobId = jobId;
    this.applicationService.getApplicationsByJob(jobId).subscribe({
      next: (data) => {
        this.selectedJobApplications = data.filter(app => app.status !== 'WITHDRAWN');
        this.loadInterviewsForRecruiter();
        setTimeout(() => {
          document.getElementById('applicants-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: (err) => console.error('Error fetching applicants', err)
    });
  }

  loadInterviewsForRecruiter() {
    this.selectedJobApplications.forEach(app => {
      if (app.applicationId && (app.status === 'INTERVIEW_SCHEDULED' || app.status === 'CONFIRMED')) {
        this.interviewService.getInterviewsByApplication(app.applicationId).subscribe({
          next: (interviews) => {
            if (interviews && interviews.length > 0) {
              const activeInterview = interviews.find(i => i.status !== 'CANCELLED');
              if (activeInterview) {
                this.recruiterInterviews[app.applicationId!] = activeInterview;
              }
            }
          },
          error: (err) => console.error('Error fetching interview for app', app.applicationId, err)
        });
      }
    });
  }

  updateApplicationStatus(appId: number | undefined, status: string) {
    if (!appId) return;
    this.applicationService.updateStatus(appId, status).subscribe({
      next: (res) => {
        alert(`Application status updated to ${status}`);
        this.sendSystemNotification(appId, 'Status Update', `Your application status has been updated to ${status}`);
        if (this.selectedJobId) this.viewApplicants(this.selectedJobId);
      },
      error: (err) => console.error('Error updating status', err)
    });
  }

  applyForJob(job: any) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const id = job.jobId || job.id;
    if (!id) {
      console.error('Job ID is missing from object:', job);
      alert('Error: Job ID is missing. Cannot apply.');
      return;
    }
    this.router.navigate(['/candidate/apply', id]);
  }

  withdrawApplication(appId: number | undefined) {
    if (!appId) return;
    if (confirm('Are you sure you want to withdraw this application?')) {
      this.applicationService.withdrawApplication(appId).subscribe({
        next: () => {
          alert('Application withdrawn successfully.');
          this.loadMyApplications();
        },
        error: (err) => {
          console.error('Error withdrawing application', err);
          alert('Failed to withdraw application.');
        }
      });
    }
  }

  deleteJob(jobId: number | undefined) {
    if (!jobId) return;
    if (confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      this.jobService.deleteJob(jobId).subscribe({
        next: () => {
          alert('Job deleted successfully.');
          this.loadJobs();
        },
        error: (err) => {
          console.error('Error deleting job', err);
          alert('Failed to delete job.');
        }
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}