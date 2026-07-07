import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { JobOffer, StatutOffre } from '../../../models/job.model';
import { extractErrorMessage } from '../../../services/api';

type Onglet = 'toutes' | 'actif' | 'ferme' | 'brouillon';
type Vue = 'liste' | 'kanban';

const COLONNES_KANBAN: { statut: StatutOffre; label: string }[] = [
  { statut: 'brouillon', label: 'Brouillon' },
  { statut: 'actif', label: 'Actif' },
  { statut: 'ferme', label: 'Fermé' },
];

@Component({
  selector: 'app-jobs',
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);

  readonly offres = signal<JobOffer[]>([]);
  readonly loading = signal(true);
  readonly onglet = signal<Onglet>('toutes');
  readonly vue = signal<Vue>('liste');
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly colonnesKanban = COLONNES_KANBAN;

  readonly offresParColonne = computed(() => {
    const offres = this.offres();
    return COLONNES_KANBAN.map((colonne) => ({
      ...colonne,
      offres: offres.filter((o) => o.statut === colonne.statut),
    }));
  });

  readonly form = this.fb.nonNullable.group({
    titre: [''],
    departement: [''],
    localisation: [''],
    description: [''],
    type_lieu: ['presentiel'],
    type_contrat: ['temps_plein'],
    statut: ['brouillon'],
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading.set(true);
    // En vue Kanban on affiche toutes les colonnes ensemble, donc on ignore le filtre d'onglet.
    const statut = this.vue() === 'liste' && this.onglet() !== 'toutes' ? this.onglet() : undefined;
    this.jobService.list({ mine: true, statut }).subscribe({
      next: (res) => {
        this.offres.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changerOnglet(onglet: Onglet): void {
    this.onglet.set(onglet);
    this.charger();
  }

  changerVue(vue: Vue): void {
    this.vue.set(vue);
    this.charger();
  }

  ouvrirCreation(): void {
    this.editingId.set(null);
    this.form.reset({
      titre: '',
      departement: '',
      localisation: '',
      description: '',
      type_lieu: 'presentiel',
      type_contrat: 'temps_plein',
      statut: 'brouillon',
    });
    this.showForm.set(true);
  }

  ouvrirEdition(offre: JobOffer): void {
    this.editingId.set(offre.id);
    this.form.reset({
      titre: offre.titre,
      departement: offre.departement ?? '',
      localisation: offre.localisation ?? '',
      description: offre.description ?? '',
      type_lieu: offre.type_lieu,
      type_contrat: offre.type_contrat,
      statut: offre.statut,
    });
    this.showForm.set(true);
  }

  annuler(): void {
    this.showForm.set(false);
    this.errorMessage.set(null);
  }

  enregistrer(): void {
    this.saving.set(true);
    this.errorMessage.set(null);
    const payload = this.form.getRawValue() as Partial<JobOffer> & { statut: StatutOffre };
    const id = this.editingId();

    const requete = id ? this.jobService.update(id, payload) : this.jobService.create(payload);

    requete.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.charger();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  supprimer(offre: JobOffer): void {
    if (!confirm(`Supprimer l'offre "${offre.titre}" ?`)) return;
    this.jobService.delete(offre.id).subscribe(() => this.charger());
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
