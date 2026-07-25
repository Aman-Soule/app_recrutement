import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminCompanyService } from '../../../services/admin-company.service';
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

  supprimer(): void {
    const entreprise = this.entreprise();
    if (!entreprise) return;
    if (!confirm(`Supprimer l'entreprise "${entreprise.nom}" ? Ses offres d'emploi seront aussi supprimées.`)) {
      return;
    }
    this.companyService.delete(entreprise.id).subscribe({
      next: () => this.router.navigate(['/admin/companies']),
      error: () => {},
    });
  }
}
