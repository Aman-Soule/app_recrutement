import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { CandidateProfile } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-profile-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit implements OnInit {
  private fb = inject(FormBuilder);
  private candidateProfileService = inject(CandidateProfileService);
  private router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
    this.candidateProfileService.show().subscribe({
      next: (profil) => {
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
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  annuler(): void {
    this.router.navigate(['/candidate/profile']);
  }

  enregistrer(): void {
    this.saving.set(true);
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
