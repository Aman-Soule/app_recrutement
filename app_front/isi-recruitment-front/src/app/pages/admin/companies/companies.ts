import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminCompanyService } from '../../../services/admin-company.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { Company } from '../../../models/user.model';

type CompanyRow = Company & { recruteurs_count?: number; offres_count?: number };

@Component({
  selector: 'app-admin-companies',
  imports: [FormsModule, RouterLink],
  templateUrl: './companies.html',
  styleUrl: './companies.scss',
})
export class Companies implements OnInit {
  private companyService = inject(AdminCompanyService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  readonly entreprises = signal<CompanyRow[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  recherche = '';

  ngOnInit(): void {
    this.charger();
  }

  charger(page = 1): void {
    this.loading.set(true);
    this.companyService.list({ recherche: this.recherche || undefined, page }).subscribe({
      next: (res) => {
        this.entreprises.set(res.data);
        this.currentPage.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  pageSuivante(): void {
    if (this.currentPage() < this.lastPage()) this.charger(this.currentPage() + 1);
  }

  pagePrecedente(): void {
    if (this.currentPage() > 1) this.charger(this.currentPage() - 1);
  }

  voirDetail(id: number): void {
    this.router.navigate(['/admin/companies', id]);
  }

  async supprimer(entreprise: CompanyRow, event: Event): Promise<void> {
    event.stopPropagation();
    const ok = await this.confirmDialog.confirm({
      title: "Supprimer l'entreprise",
      message: `Supprimer l'entreprise "${entreprise.nom}" ? Ses offres d'emploi seront aussi supprimées. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    this.companyService.delete(entreprise.id).subscribe({
      next: () => this.charger(this.currentPage()),
      error: () => {},
    });
  }
}
