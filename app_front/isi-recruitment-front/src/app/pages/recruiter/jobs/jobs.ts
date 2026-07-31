import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { SkillService } from '../../../services/skill.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { JobOffer, StatutOffre } from '../../../models/job.model';
import { Skill } from '../../../models/user.model';
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
  imports: [ReactiveFormsModule, FormsModule, DatePipe, NgClass],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private skillService = inject(SkillService);
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

  readonly toutesCompetences = signal<Skill[]>([]);
  readonly competencesRequisesIds = signal<number[]>([]);
  readonly ajoutCompetenceEnCours = signal(false);
  rechercheCompetence = '';

  readonly colonnesKanban = COLONNES_KANBAN;

  readonly suggestionsCompetences = computed<Skill[]>(() => {
    const recherche = this.rechercheCompetence.trim().toLowerCase();
    if (!recherche) return [];
    return this.toutesCompetences()
      .filter((c) => c.nom.toLowerCase().includes(recherche) && !this.estCompetenceSelectionnee(c.id))
      .slice(0, 6);
  });

  readonly competencesSelectionnees = computed<Skill[]>(() => {
    const toutes = this.toutesCompetences();
    return this.competencesRequisesIds()
      .map((id) => toutes.find((c) => c.id === id))
      .filter((c): c is Skill => c !== undefined);
  });

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
    this.skillService.list().subscribe({
      next: (skills) => this.toutesCompetences.set(skills),
      error: () => {},
    });
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
    this.competencesRequisesIds.set([]);
    this.rechercheCompetence = '';
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
    this.competencesRequisesIds.set(offre.competences_requises ?? []);
    this.rechercheCompetence = '';
    this.showForm.set(true);
  }

  annuler(): void {
    this.showForm.set(false);
    this.errorMessage.set(null);
  }

  estCompetenceSelectionnee(skillId: number): boolean {
    return this.competencesRequisesIds().includes(skillId);
  }

  toggleCompetence(skillId: number): void {
    if (this.estCompetenceSelectionnee(skillId)) {
      this.competencesRequisesIds.update((ids) => ids.filter((id) => id !== skillId));
    } else {
      this.competencesRequisesIds.update((ids) => [...ids, skillId]);
    }
  }

  selectionnerSuggestion(skill: Skill): void {
    if (!this.estCompetenceSelectionnee(skill.id)) {
      this.competencesRequisesIds.update((ids) => [...ids, skill.id]);
    }
    this.rechercheCompetence = '';
  }

  /** Ajoute la compétence saisie : la sélectionne si elle existe déjà, sinon la crée. */
  ajouterCompetence(): void {
    const nom = this.rechercheCompetence.trim();
    if (!nom) return;

    const existante = this.toutesCompetences().find((c) => c.nom.toLowerCase() === nom.toLowerCase());
    if (existante) {
      this.selectionnerSuggestion(existante);
      return;
    }

    this.ajoutCompetenceEnCours.set(true);
    this.errorMessage.set(null);
    this.skillService.create(nom).subscribe({
      next: (res) => {
        this.toutesCompetences.update((list) => [...list, res.competence]);
        this.competencesRequisesIds.update((ids) => [...ids, res.competence.id]);
        this.rechercheCompetence = '';
        this.ajoutCompetenceEnCours.set(false);
      },
      error: (err) => {
        this.ajoutCompetenceEnCours.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
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
    const payload = {
      ...this.form.getRawValue(),
      competences_requises: this.competencesRequisesIds(),
    } as Partial<JobOffer> & { statut: StatutOffre };

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
