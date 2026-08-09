import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { JobOffer } from '../../../models/job.model';
import { Application } from '../../../models/application.model';
import { CandidateProfile } from '../../../models/user.model';
import { MatchingModal, MatchingModalPhase } from '../../../shared/components/matching-modal/matching-modal';

@Component({
  selector: 'app-job-detail',
  imports: [FormsModule, RouterLink, MatchingModal],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
})
export class JobDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private candidateProfileService = inject(CandidateProfileService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly offre = signal<JobOffer | null>(null);
  readonly profil = signal<CandidateProfile | null>(null);
  readonly candidatures = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly postulation = signal(false);
  readonly erreur = signal('');
  readonly succes = signal(false);

  lettreMotivation = '';
  lettreMotivationFichier: File | null = null;

  readonly matchOpen = signal(false);
  readonly matchPhase = signal<MatchingModalPhase>('calculating');
  readonly matchScore = signal<number | null>(null);
  readonly matchMatched = signal<string[]>([]);
  readonly matchMissing = signal<string[]>([]);
  readonly matchResume = signal<string | null>(null);

  readonly dejaPostule = computed(() =>
    this.candidatures().some((c) => c.job_offer_id === this.offre()?.id),
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.jobService.get(id).subscribe({
      next: (offre) => {
        this.offre.set(offre);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.applicationService.mesCandidatures().subscribe({
      next: (candidatures) => this.candidatures.set(candidatures),
      error: () => {},
    });

    this.candidateProfileService.show().subscribe({
      next: (profil) => this.profil.set(profil),
      error: () => {},
    });
  }

  surLettreFichierSelectionnee(event: Event): void {
    this.lettreMotivationFichier = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  async postuler(): Promise<void> {
    const offre = this.offre();
    if (!offre) return;

    const ok = await this.confirmDialog.confirm({
      title: 'Envoyer ma candidature',
      message: `Confirmer l'envoi de votre candidature pour "${offre.titre}" ? Vous ne pourrez pas la retirer une fois envoyée.`,
      confirmLabel: 'Envoyer ma candidature',
    });
    if (!ok) return;

    this.postulation.set(true);
    this.erreur.set('');

    // Ouvre la modal immédiatement : l'animation de calcul couvre le temps réel de l'appel réseau
    // (le score IA est calculé de façon synchrone côté serveur avant la réponse).
    this.matchScore.set(null);
    this.matchMatched.set([]);
    this.matchMissing.set([]);
    this.matchResume.set(null);
    this.matchPhase.set('calculating');
    this.matchOpen.set(true);

    this.applicationService
      .postuler(offre.id, {
        lettre_motivation: this.lettreMotivation || undefined,
        lettre_motivation_fichier: this.lettreMotivationFichier,
        cv_url: this.profil()?.cv_url ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.candidatures.update((c) => [...c, res.candidature]);
          this.postulation.set(false);
          this.succes.set(true);

          const candidature = res.candidature;
          if (candidature.score_matching_ia !== null) {
            this.matchScore.set(candidature.score_matching_ia);
            this.matchMatched.set(candidature.score_detaille?.competences_matchees ?? []);
            this.matchMissing.set(candidature.score_detaille?.competences_manquantes ?? []);
            this.matchResume.set(candidature.score_detaille?.resume_ia ?? null);
            this.matchPhase.set('done');
          } else {
            this.matchPhase.set('error');
          }
        },
        error: (err) => {
          this.erreur.set(err?.error?.message || "Impossible d'envoyer votre candidature.");
          this.postulation.set(false);
          this.matchOpen.set(false);
        },
      });
  }

  fermerMatchModal(): void {
    this.matchOpen.set(false);
  }
}
