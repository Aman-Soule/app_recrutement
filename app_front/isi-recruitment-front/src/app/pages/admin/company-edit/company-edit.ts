import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminCompanyService } from '../../../services/admin-company.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { Company } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-admin-company-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './company-edit.html',
  styleUrl: './company-edit.scss',
})
export class CompanyEdit implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(AdminCompanyService);
  private confirmDialog = inject(ConfirmDialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  companyId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    nom: [''],
    secteur: [''],
    description: [''],
    site_web: [''],
    taille: [''],
    localisation: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.loading.set(false);
      return;
    }

    this.companyId = Number(idParam);
    this.companyService.show(this.companyId).subscribe({
      next: (entreprise) => {
        this.form.patchValue({
          nom: entreprise.nom,
          secteur: entreprise.secteur ?? '',
          description: entreprise.description ?? '',
          site_web: entreprise.site_web ?? '',
          taille: entreprise.taille ?? '',
          localisation: entreprise.localisation ?? '',
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  annuler(): void {
    this.router.navigate(['/admin/companies']);
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
    const raw = this.form.getRawValue();
    const payload: Partial<Company> = {
      ...raw,
      taille: (raw.taille || null) as Company['taille'],
    };
    const requete = this.companyId
      ? this.companyService.update(this.companyId, payload)
      : this.companyService.create(payload);

    requete.subscribe({
      next: (res) => {
        this.saving.set(false);
        const id = this.companyId ?? res.entreprise.id;
        this.router.navigate(['/admin/companies', id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
