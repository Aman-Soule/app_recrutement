import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { JobOffer } from '../../../models/job.model';
import { Application } from '../../../models/application.model';
import { CandidateProfile } from '../../../models/user.model';

@Component({
  selector: 'app-job-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
})
export class JobDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private candidateProfileService = inject(CandidateProfileService);

  readonly offre = signal<JobOffer | null>(null);
  readonly profil = signal<CandidateProfile | null>(null);
  readonly candidatures = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly postulation = signal(false);
  readonly erreur = signal('');
  readonly succes = signal(false);

  lettreMotivation = '';

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

  postuler(): void {
    const offre = this.offre();
    if (!offre) return;

    this.postulation.set(true);
    this.erreur.set('');

    this.applicationService
      .postuler(offre.id, {
        lettre_motivation: this.lettreMotivation || undefined,
        cv_url: this.profil()?.cv_url ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.candidatures.update((c) => [...c, res.candidature]);
          this.postulation.set(false);
          this.succes.set(true);
        },
        error: (err) => {
          this.erreur.set(err?.error?.message || "Impossible d'envoyer votre candidature.");
          this.postulation.set(false);
        },
      });
  }
}
