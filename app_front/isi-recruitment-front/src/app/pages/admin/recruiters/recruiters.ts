import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminRecruiterService } from '../../../services/admin-recruiter.service';
import { AdminCompanyService } from '../../../services/admin-company.service';
import { Company, User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-recruiters',
  imports: [FormsModule, RouterLink],
  templateUrl: './recruiters.html',
  styleUrl: './recruiters.scss',
})
export class Recruiters implements OnInit {
  private recruiterService = inject(AdminRecruiterService);
  private companyService = inject(AdminCompanyService);

  readonly recruteurs = signal<User[]>([]);
  readonly entreprises = signal<Company[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  recherche = '';
  selectedCompanyId: number | null = null;

  ngOnInit(): void {
    this.companyService.list().subscribe({
      next: (res) => this.entreprises.set(res.data),
      error: () => {},
    });
    this.charger();
  }

  charger(page = 1): void {
    this.loading.set(true);
    this.recruiterService
      .list({
        recherche: this.recherche || undefined,
        company_id: this.selectedCompanyId ?? undefined,
        page,
      })
      .subscribe({
        next: (res) => {
          this.recruteurs.set(res.data);
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
}
