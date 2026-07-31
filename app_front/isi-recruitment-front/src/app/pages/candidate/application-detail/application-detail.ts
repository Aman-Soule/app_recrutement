import { DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { InterviewService } from '../../../services/interview.service';
import { Application, LIBELLES_STATUT_CANDIDATURE, StatutCandidature } from '../../../models/application.model';
import { LIBELLES_ETAPE_ENTRETIEN, LIBELLES_STATUT_ENTRETIEN, LIBELLES_TYPE_ENTRETIEN } from '../../../models/interview.model';
import { ApplicationPipeline } from '../../../shared/components/application-pipeline/application-pipeline';
import { AiScoreDetail } from '../../../shared/components/ai-score-detail/ai-score-detail';

const INTERVALLE_POLLING_MS = 5000;
const POLLING_MAX_TENTATIVES = 24; // ~2 minutes

@Component({
  selector: 'app-application-detail',
  imports: [DatePipe, NgClass, RouterLink, ApplicationPipeline, AiScoreDetail],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss',
})
export class ApplicationDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private applicationService = inject(ApplicationService);
  private interviewService = inject(InterviewService);

  readonly application = signal<Application | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly confirmingId = signal<number | null>(null);
  readonly relanceScoreEnCours = signal(false);

  readonly libelles = LIBELLES_STATUT_CANDIDATURE;
  readonly libellesEtape = LIBELLES_ETAPE_ENTRETIEN;
  readonly libellesStatutEntretien = LIBELLES_STATUT_ENTRETIEN;
  readonly libellesTypeEntretien = LIBELLES_TYPE_ENTRETIEN;

  private intervalId?: ReturnType<typeof setInterval>;
  private tentativesPolling = 0;
  private applicationId = 0;

  ngOnInit(): void {
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));

    this.applicationService.voir(this.applicationId).subscribe({
      next: (application) => {
        this.application.set(application);
        this.loading.set(false);
        this.gererPollingScore(application);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger cette candidature.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  /** Tant que le score IA n'est pas encore calculé (analyse en cours), on recharge périodiquement */
  private gererPollingScore(application: Application): void {
    const termine = application.score_matching_ia !== null || !!application.score_ia_erreur;

    if (termine || this.tentativesPolling >= POLLING_MAX_TENTATIVES) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
      return;
    }

    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.tentativesPolling++;
        this.applicationService.voir(this.applicationId).subscribe({
          next: (application) => {
            this.application.set(application);
            this.gererPollingScore(application);
          },
          error: () => {},
        });
      }, INTERVALLE_POLLING_MS);
    }
  }

  relancerScoreIa(): void {
    if (this.relanceScoreEnCours()) return;

    this.relanceScoreEnCours.set(true);
    this.applicationService.relancerScoreIa(this.applicationId).subscribe({
      next: (application) => {
        this.relanceScoreEnCours.set(false);
        this.application.set(application);
        this.tentativesPolling = 0;
        this.gererPollingScore(application);
      },
      error: () => this.relanceScoreEnCours.set(false),
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

  confirmerEntretien(interviewId: number): void {
    this.confirmingId.set(interviewId);
    this.interviewService.confirmer(interviewId).subscribe({
      next: ({ entretien }) => {
        this.confirmingId.set(null);
        this.application.update((application) => {
          if (!application) return application;
          return {
            ...application,
            entretiens: application.entretiens?.map((e) => (e.id === entretien.id ? entretien : e)),
          };
        });
      },
      error: () => this.confirmingId.set(null),
    });
  }
}
