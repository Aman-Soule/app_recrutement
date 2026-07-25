import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RecruiterProfileService } from '../../../services/recruiter-profile.service';
import { CompanyService } from '../../../services/company.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { Company } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-company-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './company-edit.html',
  styleUrl: './company-edit.scss',
})
export class CompanyEdit implements OnInit {
  private fb = inject(FormBuilder);
  private recruiterProfileService = inject(RecruiterProfileService);
  private companyService = inject(CompanyService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private companyId: number | null = null;

  readonly companyForm = this.fb.nonNullable.group({
    nom: [''],
    secteur: [''],
    description: [''],
    site_web: [''],
    taille: [''],
    localisation: [''],
  });

  ngOnInit(): void {
    this.recruiterProfileService.show().subscribe({
      next: (profil) => {
        this.companyId = profil.entreprise?.id ?? null;
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

  annuler(): void {
    this.router.navigate(['/recruiter/settings']);
  }

  async enregistrer(): Promise<void> {
    if (this.companyId) {
      const ok = await this.confirmDialog.confirm({
        message: "Confirmer la modification des informations de l'entreprise ?",
        confirmLabel: 'Enregistrer',
      });
      if (!ok) return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const raw = this.companyForm.getRawValue();
    const payload: Partial<Company> = {
      ...raw,
      taille: (raw.taille || null) as Company['taille'],
    };
    const requete = this.companyId
      ? this.companyService.update(this.companyId, payload)
      : this.companyService.create(payload);

    requete.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/recruiter/settings']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
