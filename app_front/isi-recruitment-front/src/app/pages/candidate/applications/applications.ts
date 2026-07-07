import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ApplicationService } from '../../../services/application.service';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';

@Component({
  selector: 'app-applications',
  imports: [DatePipe, NgClass],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications implements OnInit {
  private applicationService = inject(ApplicationService);

  readonly candidatures = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly libelles = LIBELLES_STATUT_CANDIDATURE;

  ngOnInit(): void {
    this.applicationService.mesCandidatures().subscribe({
      next: (candidatures) => {
        this.candidatures.set(candidatures);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  badgeClass(statut: StatutCandidature): string {
    switch (statut) {
      case 'embauche':
        return 'badge-success';
      case 'rejete':
        return 'badge-danger';
      case 'entretien':
      case 'offre_envoyee':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  }
}
