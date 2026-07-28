import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { AiMatchScoreService } from '../../../services/ai-match-score.service';
import { JobOffer, StatutOffre } from '../../../models/job.model';
import { AiMatchScore } from '../../../models/application.model';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { MatchScore } from '../../../shared/components/match-score/match-score';

@Component({
  selector: 'app-job-detail',
  imports: [NgClass, RouterLink, Avatar, MatchScore],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
})
export class JobDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private aiMatchScoreService = inject(AiMatchScoreService);

  readonly offre = signal<JobOffer | null>(null);
  readonly loading = signal(true);

  readonly classement = signal<AiMatchScore[]>([]);
  readonly classementLoading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);

  private offreId = 0;

  ngOnInit(): void {
    this.offreId = Number(this.route.snapshot.paramMap.get('id'));

    this.jobService.get(this.offreId).subscribe({
      next: (offre) => {
        this.offre.set(offre);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.chargerClassement();
  }

  chargerClassement(page = 1): void {
    this.classementLoading.set(true);
    this.aiMatchScoreService.meilleursCandidats(this.offreId, page).subscribe({
      next: (res) => {
        this.classement.set(res.data);
        this.currentPage.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.classementLoading.set(false);
      },
      error: () => this.classementLoading.set(false),
    });
  }

  pageSuivante(): void {
    if (this.currentPage() < this.lastPage()) this.chargerClassement(this.currentPage() + 1);
  }

  pagePrecedente(): void {
    if (this.currentPage() > 1) this.chargerClassement(this.currentPage() - 1);
  }

  voirCandidat(candidateProfileId: number): void {
    this.router.navigate(['/recruiter/candidates', candidateProfileId]);
  }

  badgeClass(statut: StatutOffre): string {
    switch (statut) {
      case 'actif':
        return 'badge-success';
      case 'ferme':
        return 'badge-neutral';
      default:
        return 'badge-warning';
    }
  }
}
