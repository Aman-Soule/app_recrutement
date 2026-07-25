import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminCompanyService } from '../../../services/admin-company.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { Company, RecruiterProfile } from '../../../models/user.model';

type CompanyWithRecruiters = Company & { recruteurs: RecruiterProfile[] };

@Component({
  selector: 'app-admin-company-detail',
  imports: [RouterLink],
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.scss',
})
export class CompanyDetail implements OnInit {
  private companyService = inject(AdminCompanyService);
  private confirmDialog = inject(ConfirmDialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly entreprise = signal<CompanyWithRecruiters | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.companyService.show(id).subscribe({
      next: (entreprise) => {
        this.entreprise.set(entreprise);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  async supprimer(): Promise<void> {
    const entreprise = this.entreprise();
    if (!entreprise) return;

    const ok = await this.confirmDialog.confirm({
      title: "Supprimer l'entreprise",
      message: `Supprimer l'entreprise "${entreprise.nom}" ? Ses offres d'emploi seront aussi supprimées. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    this.companyService.delete(entreprise.id).subscribe({
      next: () => this.router.navigate(['/admin/companies']),
      error: () => {},
    });
  }
}
