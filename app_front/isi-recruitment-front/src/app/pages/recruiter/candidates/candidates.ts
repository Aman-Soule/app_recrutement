import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { CandidateProfile, Disponibilite } from '../../../models/user.model';

type Vue = 'liste' | 'kanban';

const COLONNES_KANBAN: { disponibilite: Disponibilite; label: string }[] = [
  { disponibilite: 'disponible', label: 'Disponible' },
  { disponibilite: 'a_lecoute', label: "À l'écoute" },
  { disponibilite: 'non_disponible', label: 'Non disponible' },
];

@Component({
  selector: 'app-candidates',
  imports: [FormsModule, NgClass],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss',
})
export class Candidates implements OnInit {
  private candidateProfileService = inject(CandidateProfileService);

  readonly candidats = signal<CandidateProfile[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly vue = signal<Vue>('liste');
  recherche = '';

  readonly colonnesKanban = COLONNES_KANBAN;

  readonly candidatsParColonne = computed(() => {
    const candidats = this.candidats();
    return COLONNES_KANBAN.map((colonne) => ({
      ...colonne,
      candidats: candidats.filter((c) => c.disponibilite === colonne.disponibilite),
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

  changerVue(vue: Vue): void {
    this.vue.set(vue);
  }

  pageSuivante(): void {
    if (this.currentPage() < this.lastPage()) this.charger(this.currentPage() + 1);
  }

  pagePrecedente(): void {
    if (this.currentPage() > 1) this.charger(this.currentPage() - 1);
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
