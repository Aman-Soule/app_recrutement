import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { JobOffer } from '../../../models/job.model';
import { Application } from '../../../models/application.model';

@Component({
  selector: 'app-jobs',
  imports: [FormsModule, RouterLink],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);

  readonly offres = signal<JobOffer[]>([]);
  readonly candidatures = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);

  recherche = '';
  typeContrat = '';
  typeLieu = '';

  ngOnInit(): void {
    this.applicationService.mesCandidatures().subscribe({
      next: (candidatures) => this.candidatures.set(candidatures),
      error: () => {},
    });
    this.charger();
  }

  charger(page = 1): void {
    this.loading.set(true);
    this.jobService
      .list({
        statut: 'actif',
        recherche: this.recherche || undefined,
        type_contrat: this.typeContrat || undefined,
        type_lieu: this.typeLieu || undefined,
        page,
      })
      .subscribe({
        next: (res) => {
          this.offres.set(res.data);
          this.currentPage.set(res.current_page);
          this.lastPage.set(res.last_page);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  dejaPostule(offreId: number): boolean {
    return this.candidatures().some((c) => c.job_offer_id === offreId);
  }

  pageSuivante(): void {
    if (this.currentPage() < this.lastPage()) this.charger(this.currentPage() + 1);
  }

  pagePrecedente(): void {
    if (this.currentPage() > 1) this.charger(this.currentPage() - 1);
  }
}
