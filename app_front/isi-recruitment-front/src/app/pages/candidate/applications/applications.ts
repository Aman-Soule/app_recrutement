import { DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';
import { MatchScore } from '../../../shared/components/match-score/match-score';

const INTERVALLE_POLLING_MS = 5000;
const POLLING_MAX_TENTATIVES = 24; // ~2 minutes

@Component({
  selector: 'app-applications',
  imports: [DatePipe, NgClass, FormsModule, MatchScore],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications implements OnInit, OnDestroy {
  private applicationService = inject(ApplicationService);
  private router = inject(Router);

  readonly candidatures = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly libelles = LIBELLES_STATUT_CANDIDATURE;
  readonly statuts = Object.keys(LIBELLES_STATUT_CANDIDATURE) as StatutCandidature[];

  private intervalId?: ReturnType<typeof setInterval>;
  private tentativesPolling = 0;

  recherche = '';
  filtreStatut: StatutCandidature | '' = '';

  readonly candidaturesFiltrees = computed(() => {
    const recherche = this.recherche.trim().toLowerCase();
    const statut = this.filtreStatut;
    return this.candidatures().filter((c) => {
      const correspondRecherche =
        !recherche ||
        c.offre?.titre?.toLowerCase().includes(recherche) ||
        c.offre?.entreprise?.nom?.toLowerCase().includes(recherche);
      const correspondStatut = !statut || c.statut === statut;
      return correspondRecherche && correspondStatut;
    });
  });

  ngOnInit(): void {
    this.applicationService.mesCandidatures().subscribe({
      next: (candidatures) => {
        this.candidatures.set(candidatures);
        this.loading.set(false);
        this.gererPollingScores(candidatures);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  /** Tant que des candidatures n'ont pas encore de score IA (analyse en cours), on recharge périodiquement */
  private gererPollingScores(candidatures: Application[]): void {
    const enAttente = candidatures.some((c) => c.score_matching_ia === null);

    if (!enAttente || this.tentativesPolling >= POLLING_MAX_TENTATIVES) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
      return;
    }

    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.tentativesPolling++;
        this.applicationService.mesCandidatures().subscribe({
          next: (candidatures) => {
            this.candidatures.set(candidatures);
            this.gererPollingScores(candidatures);
          },
          error: () => {},
        });
      }, INTERVALLE_POLLING_MS);
    }
  }

  voirDetail(candidatureId: number): void {
    this.router.navigate(['/candidate/applications', candidatureId]);
  }

  badgeClass(statut: StatutCandidature): string {
  switch (statut) {
    case 'embauche':
      return 'badge-success';
    case 'rejete':
      return 'badge-danger';
    case 'entretien':
      return 'badge-info';
    case 'preselection':
    case 'examen':
      return 'badge-warning';
    default:
      return 'badge-neutral';
  }
}
}
