import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { SkillService } from '../../../services/skill.service';
import { AuthService } from '../../../services/auth';
import { CandidateProfile, NiveauCompetence, Skill } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

interface CompetenceSelection {
  skill_id: number;
  niveau: NiveauCompetence;
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private candidateProfileService = inject(CandidateProfileService);
  private skillService = inject(SkillService);
  private authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly savingCompetences = signal(false);
  readonly uploadingAvatar = signal(false);
  readonly uploadingCv = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly toutesCompetences = signal<Skill[]>([]);
  readonly profil = signal<CandidateProfile | null>(null);
  readonly selectionCompetences = signal<CompetenceSelection[]>([]);

  readonly niveaux: NiveauCompetence[] = ['debutant', 'intermediaire', 'avance', 'expert'];

  readonly form = this.fb.nonNullable.group({
    titre: [''],
    biographie: [''],
    localisation: [''],
    portfolio_url: [''],
    linkedin_url: [''],
    annees_experience: [0],
    disponibilite: ['a_lecoute'],
    type_contrat_souhaite: [''],
    type_lieu_souhaite: [''],
  });

  ngOnInit(): void {
    this.skillService.list().subscribe({
      next: (skills) => this.toutesCompetences.set(skills),
      error: () => {},
    });

    this.candidateProfileService.show().subscribe({
      next: (profil) => {
        this.profil.set(profil);
        this.form.patchValue({
          titre: profil.titre ?? '',
          biographie: profil.biographie ?? '',
          localisation: profil.localisation ?? '',
          portfolio_url: profil.portfolio_url ?? '',
          linkedin_url: profil.linkedin_url ?? '',
          annees_experience: profil.annees_experience,
          disponibilite: profil.disponibilite,
          type_contrat_souhaite: profil.type_contrat_souhaite ?? '',
          type_lieu_souhaite: profil.type_lieu_souhaite ?? '',
        });
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

  enregistrerProfil(): void {
    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();

    this.candidateProfileService
      .update({
        titre: raw.titre || undefined,
        biographie: raw.biographie || undefined,
        localisation: raw.localisation || undefined,
        portfolio_url: raw.portfolio_url || undefined,
        linkedin_url: raw.linkedin_url || undefined,
        annees_experience: raw.annees_experience,
        disponibilite: raw.disponibilite as CandidateProfile['disponibilite'],
        type_contrat_souhaite:
          (raw.type_contrat_souhaite as CandidateProfile['type_contrat_souhaite']) || undefined,
        type_lieu_souhaite:
          (raw.type_lieu_souhaite as CandidateProfile['type_lieu_souhaite']) || undefined,
      })
      .subscribe({
        next: (res) => {
          this.profil.set(res.profil);
          this.saving.set(false);
          this.successMessage.set('Profil mis à jour avec succès.');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(extractErrorMessage(err));
        },
      });
  }

  surAvatarSelectionne(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (!fichier) return;

    this.uploadingAvatar.set(true);
    this.errorMessage.set(null);
    this.candidateProfileService.uploadAvatar(fichier).subscribe({
      next: (res) => {
        this.profil.set({ ...this.profil(), ...res.profil });
        this.uploadingAvatar.set(false);
        this.authService.me().subscribe();
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  surCvSelectionne(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (!fichier) return;

    this.uploadingCv.set(true);
    this.errorMessage.set(null);
    this.candidateProfileService.uploadCv(fichier).subscribe({
      next: (res) => {
        this.profil.set({ ...this.profil(), ...res.profil });
        this.uploadingCv.set(false);
        this.successMessage.set('CV mis à jour.');
      },
      error: (err) => {
        this.uploadingCv.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  enregistrerCompetences(): void {
    this.savingCompetences.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.candidateProfileService.syncCompetences(this.selectionCompetences()).subscribe({
      next: () => {
        this.savingCompetences.set(false);
        this.successMessage.set('Compétences mises à jour.');
      },
      error: (err) => {
        this.savingCompetences.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
