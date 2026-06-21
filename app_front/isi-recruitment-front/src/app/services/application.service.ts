import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Application {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  status: 'Postulé' | 'Examen' | 'Entretien' | 'Offre';
  date: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private applications: Application[] = [
    {
      id: 1,
      jobTitle: 'Senior Product Designer',
      company: 'Google',
      location: 'Mountain View (Télétravail)',
      status: 'Entretien',
      date: '2026-06-15'
    },
    {
      id: 2,
      jobTitle: 'UX Researcher',
      company: 'Meta',
      location: 'London, UK',
      status: 'Examen',
      date: '2026-06-10'
    },
    {
      id: 3,
      jobTitle: 'Frontend Developer',
      company: 'Microsoft',
      location: 'Remote',
      status: 'Postulé',
      date: '2026-06-05'
    }
  ];

  getApplications(): Observable<Application[]> {
    return of(this.applications);
  }

  getApplicationById(id: number): Observable<Application | undefined> {
    return of(this.applications.find(app => app.id === id));
  }
}