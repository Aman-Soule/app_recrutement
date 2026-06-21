import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Hybrid' | 'Remote';
  salary: string;
  matchScore: number;
  skills: string[];
  description: string;
  logo: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private jobs: Job[] = [
    {
      id: 1,
      title: 'Lead UX Researcher',
      company: 'Spotify',
      location: 'Stockholm, SE',
      type: 'Remote',
      salary: '$120k - $160k',
      matchScore: 98,
      skills: ['Research Methods', 'Design Systems'],
      description: 'Matched your Research Methods & Design Systems skills',
      logo: 'spotify'
    },
    {
      id: 2,
      title: 'Senior Product Designer',
      company: 'Airbnb',
      location: 'San Francisco, US',
      type: 'Hybrid',
      salary: '$140k - $190k',
      matchScore: 91,
      skills: ['Figma Mastery', 'Visual Design'],
      description: 'Matched your Figma Mastery & Visual Design expertise',
      logo: 'airbnb'
    },
    {
      id: 3,
      title: 'UX Engineer',
      company: 'Stripe',
      location: 'Dublin, IE',
      type: 'Remote',
      salary: '$110k - $150k',
      matchScore: 85,
      skills: ['React.js', 'Prototyping'],
      description: 'Matched your React.js & Prototyping skills',
      logo: 'stripe'
    }
  ];

  getRecommendedJobs(): Observable<Job[]> {
    return of(this.jobs);
  }
}