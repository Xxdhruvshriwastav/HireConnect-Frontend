export interface Job {
    jobId?: number;
    title: string;
    company?: string;
    category: string;
    type: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    skills: string[];
    experienceRequired: string;
    postedBy: string;
    status: 'OPEN' | 'CLOSED' | 'PAUSED';
    postedAt?: string;
}
