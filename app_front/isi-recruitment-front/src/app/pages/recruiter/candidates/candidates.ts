import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { ApplicationService } from '../../../services/application.service';
import { CandidateProfile, Disponibilite } from '../../../models/user.model';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { MatchScore } from '../../../shared/components/match-score/match-score';
import { ApplicationDetailModal } from '../../../shared/components/application-detail-modal/application-detail-modal';

type Vue = 'liste' | 'kanban';

/** Toutes les candidatures d'un même recruteur tiennent facilement sur une seule page de Kanban */
const PER_PAGE_KANBAN = 200;

@Component({
  selector: 'app-candidates',
  imports: [FormsModule, NgClass, DatePipe, Avatar, MatchScore, ApplicationDetailModal],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss',
})
export class Candidates implements OnInit {
  private candidateProfileService = inject(CandidateProfileService);
  private applicationService = inject(ApplicationService);
  private router = inject(Router);

  readonly candidats = signal<CandidateProfile[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly vue = signal<Vue>('liste');
  recherche = '';

  readonly libellesStatut = LIBELLES_STATUT_CANDIDATURE;
  readonly colonnesKanban = Object.keys(LIBELLES_STATUT_CANDIDATURE) as StatutCandidature[];

  readonly candidatures = signal<Application[]>([]);
  readonly candidaturesLoading = signal(false);
  readonly candidaturesChargees = signal(false);
  readonly selectedCandidature = signal<Application | null>(null);

  readonly candidaturesParColonne = computed(() => {
    const candidatures = this.candidatures();
    return this.colonnesKanban.map((statut) => ({
      statut,
      label: LIBELLES_STATUT_CANDIDATURE[statut],
      candidatures: candidatures.filter((c) => c.statut === statut),
    }));
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(page = 1): void {
    this.loading.set(true);
    this.candidateProfileService.pourRecruteur(this.recherche || undefined, page).subscribe({
      next: (res) => {
        this.candidats.set(res.data);
        this.currentPage.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  chargerCandidatures(): void {
    this.candidaturesLoading.set(true);
    this.applicationService.pourRecruteur(1, PER_PAGE_KANBAN).subscribe({
      next: (res) => {
        this.candidatures.set(res.data);
        this.candidaturesChargees.set(true);
        this.candidaturesLoading.set(false);
      },
      error: () => this.candidaturesLoading.set(false),
    });
  }

  changerVue(vue: Vue): void {
    this.vue.set(vue);
    if (vue === 'kanban' && !this.candidaturesChargees()) {
      this.chargerCandidatures();
    }
  }

  pageSuivante(): void {
    if (this.currentPage() < this.lastPage()) this.charger(this.currentPage() + 1);
  }

  pagePrecedente(): void {
    if (this.currentPage() > 1) this.charger(this.currentPage() - 1);
  }

  voirDetail(candidatId: number): void {
    this.router.navigate(['/recruiter/candidates', candidatId]);
  }

  ouvrirCandidature(candidature: Application): void {
    this.selectedCandidature.set(candidature);
  }

  onStatutChange(updated: Application): void {
    this.candidatures.update((liste) => liste.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    this.selectedCandidature.set(updated);
  }

  badgeClass(disponibilite: Disponibilite): string {
    switch (disponibilite) {
      case 'disponible':
        return 'badge-success';
      case 'a_lecoute':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  }
}
