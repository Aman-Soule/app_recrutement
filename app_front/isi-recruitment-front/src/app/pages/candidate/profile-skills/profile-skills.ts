import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { SkillService } from '../../../services/skill.service';
import { NiveauCompetence, Skill } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

interface CompetenceSelection {
  skill_id: number;
  niveau: NiveauCompetence;
}

@Component({
  selector: 'app-profile-skills',
  imports: [FormsModule],
  templateUrl: './profile-skills.html',
  styleUrl: './profile-skills.scss',
})
export class ProfileSkills implements OnInit {
  private candidateProfileService = inject(CandidateProfileService);
  private skillService = inject(SkillService);
  private router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly ajoutCompetenceEnCours = signal(false);

  readonly toutesCompetences = signal<Skill[]>([]);
  readonly selectionCompetences = signal<CompetenceSelection[]>([]);

  readonly niveaux: NiveauCompetence[] = ['debutant', 'intermediaire', 'avance', 'expert'];

  nouvelleCompetence = '';

  readonly suggestionsCompetences = computed<Skill[]>(() => {
    const recherche = this.nouvelleCompetence.trim().toLowerCase();
    if (!recherche) return [];
    return this.toutesCompetences()
      .filter((c) => c.nom.toLowerCase().includes(recherche) && !this.estSelectionnee(c.id))
      .slice(0, 6);
  });

  readonly competencesSelectionnees = computed<(Skill & { niveau: NiveauCompetence })[]>(() => {
    const toutes = this.toutesCompetences();
    return this.selectionCompetences()
      .map((selection) => {
        const skill = toutes.find((c) => c.id === selection.skill_id);
        return skill ? { ...skill, niveau: selection.niveau } : null;
      })
      .filter((c): c is Skill & { niveau: NiveauCompetence } => c !== null);
  });

  ngOnInit(): void {
    this.skillService.list().subscribe({
      next: (skills) => this.toutesCompetences.set(skills),
      error: () => {},
    });

    this.candidateProfileService.show().subscribe({
      next: (profil) => {
        this.selectionCompetences.set(
          (profil.competences ?? []).map((c) => ({
            skill_id: c.id,
            niveau: c.pivot?.niveau ?? 'intermediaire',
          })),
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  annuler(): void {
    this.router.navigate(['/candidate/profile']);
  }

  estSelectionnee(skillId: number): boolean {
    return this.selectionCompetences().some((c) => c.skill_id === skillId);
  }

  niveauDe(skillId: number): NiveauCompetence {
    return (
      this.selectionCompetences().find((c) => c.skill_id === skillId)?.niveau ?? 'intermediaire'
    );
  }

  toggleCompetence(skillId: number): void {
    if (this.estSelectionnee(skillId)) {
      this.selectionCompetences.update((list) => list.filter((c) => c.skill_id !== skillId));
    } else {
      this.selectionCompetences.update((list) => [
        ...list,
        { skill_id: skillId, niveau: 'intermediaire' },
      ]);
    }
  }

  changerNiveau(skillId: number, niveau: string): void {
    this.selectionCompetences.update((list) =>
      list.map((c) => (c.skill_id === skillId ? { ...c, niveau: niveau as NiveauCompetence } : c)),
    );
  }

  selectionnerSuggestion(skill: Skill): void {
    if (!this.estSelectionnee(skill.id)) {
      this.selectionCompetences.update((list) => [
        ...list,
        { skill_id: skill.id, niveau: 'intermediaire' },
      ]);
    }
    this.nouvelleCompetence = '';
  }

  /** Ajoute la compétence saisie : la sélectionne si elle existe déjà, sinon la crée. */
  ajouterCompetence(): void {
    const nom = this.nouvelleCompetence.trim();
    if (!nom) return;

    const existante = this.toutesCompetences().find(
      (c) => c.nom.toLowerCase() === nom.toLowerCase(),
    );
    if (existante) {
      this.selectionnerSuggestion(existante);
      return;
    }

    this.ajoutCompetenceEnCours.set(true);
    this.errorMessage.set(null);
    this.skillService.create(nom).subscribe({
      next: (res) => {
        this.toutesCompetences.update((list) => [...list, res.competence]);
        this.selectionCompetences.update((list) => [
          ...list,
          { skill_id: res.competence.id, niveau: 'intermediaire' },
        ]);
        this.nouvelleCompetence = '';
        this.ajoutCompetenceEnCours.set(false);
      },
      error: (err) => {
        this.ajoutCompetenceEnCours.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  enregistrer(): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.candidateProfileService.syncCompetences(this.selectionCompetences()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/candidate/profile']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
