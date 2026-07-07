import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RecruiterProfileService } from '../../../services/recruiter-profile.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth';
import { Company, RecruiterProfile } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private recruiterProfileService = inject(RecruiterProfileService);
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);

  readonly onglet = signal<'entreprise' | 'profil'>('entreprise');
  readonly loading = signal(true);
  readonly savingCompany = signal(false);
  readonly savingProfile = signal(false);
  readonly uploadingLogo = signal(false);
  readonly uploadingAvatar = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly profil = signal<RecruiterProfile | null>(null);

  readonly companyForm = this.fb.nonNullable.group({
    nom: [''],
    secteur: [''],
    description: [''],
    site_web: [''],
    taille: [''],
    localisation: [''],
  });

  readonly profileForm = this.fb.nonNullable.group({
    titre: [''],
    telephone: [''],
  });

  ngOnInit(): void {
    this.recruiterProfileService.show().subscribe({
      next: (profil) => {
        this.profil.set(profil);
        this.profileForm.patchValue({ titre: profil.titre ?? '', telephone: profil.telephone ?? '' });
        if (profil.entreprise) {
          this.companyForm.patchValue({
            nom: profil.entreprise.nom,
            secteur: profil.entreprise.secteur ?? '',
            description: profil.entreprise.description ?? '',
            site_web: profil.entreprise.site_web ?? '',
            taille: profil.entreprise.taille ?? '',
            localisation: profil.entreprise.localisation ?? '',
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changerOnglet(onglet: 'entreprise' | 'profil'): void {
    this.onglet.set(onglet);
  }

  enregistrerEntreprise(): void {
    this.savingCompany.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    const companyId = this.profil()?.entreprise?.id;
    const raw = this.companyForm.getRawValue();
    const payload: Partial<Company> = {
      ...raw,
      taille: (raw.taille || null) as Company['taille'],
    };
    const requete = companyId
      ? this.companyService.update(companyId, payload)
      : this.companyService.create(payload);

    requete.subscribe({
      next: (res) => {
        this.savingCompany.set(false);
        this.successMessage.set('Entreprise enregistrée.');
        this.profil.update((p) => (p ? { ...p, entreprise: res.entreprise } : p));
      },
      error: (err) => {
        this.savingCompany.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  enregistrerProfil(): void {
    this.savingProfile.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.recruiterProfileService.update(this.profileForm.getRawValue()).subscribe({
      next: (res) => {
        this.savingProfile.set(false);
        this.successMessage.set('Profil mis à jour.');
        this.profil.set(res.profil);
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  surLogoSelectionne(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    const companyId = this.profil()?.entreprise?.id;
    if (!fichier || !companyId) return;

    this.uploadingLogo.set(true);
    this.errorMessage.set(null);
    this.companyService.uploadLogo(companyId, fichier).subscribe({
      next: (res) => {
        this.profil.update((p) => (p ? { ...p, entreprise: res.entreprise } : p));
        this.uploadingLogo.set(false);
      },
      error: (err) => {
        this.uploadingLogo.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  surAvatarSelectionne(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (!fichier) return;

    this.uploadingAvatar.set(true);
    this.errorMessage.set(null);
    this.recruiterProfileService.uploadAvatar(fichier).subscribe({
      next: (res) => {
        this.profil.set(res.profil);
        this.uploadingAvatar.set(false);
        this.authService.me().subscribe();
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
