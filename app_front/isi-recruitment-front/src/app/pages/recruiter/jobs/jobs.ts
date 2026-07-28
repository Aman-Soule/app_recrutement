import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
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
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

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
    date_cloture: [''],
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

  voirDetail(offreId: number): void {
    this.router.navigate(['/recruiter/jobs', offreId]);
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
      date_cloture: '',
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
      date_cloture: offre.date_cloture ?? '',
    });
    this.showForm.set(true);
  }

  annuler(): void {
    this.showForm.set(false);
    this.errorMessage.set(null);
  }

  async enregistrer(): Promise<void> {
    const id = this.editingId();

    if (id) {
      const ok = await this.confirmDialog.confirm({
        message: 'Confirmer la modification de cette offre ?',
        confirmLabel: 'Modifier',
      });
      if (!ok) return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const payload = this.form.getRawValue() as Partial<JobOffer> & { statut: StatutOffre };

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

  async supprimer(offre: JobOffer): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: "Supprimer l'offre",
      message: `Supprimer l'offre "${offre.titre}" ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

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
