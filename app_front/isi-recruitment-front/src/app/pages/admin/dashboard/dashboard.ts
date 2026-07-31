import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminStatsService } from '../../../services/admin-stats.service';
import { AdminCompanyService } from '../../../services/admin-company.service';
import { AdminStats, Company } from '../../../models/user.model';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private statsService = inject(AdminStatsService);
  private companyService = inject(AdminCompanyService);
  private authService = inject(AuthService);

  readonly loading = signal(true);
  readonly stats = signal<AdminStats | null>(null);
  readonly entreprises = signal<Company[]>([]);
  selectedCompanyId: number | null = null;

  readonly prenom = computed(() => {
    const nom = this.authService.currentUser()?.name;
    return nom ? nom.split(' ')[0] : '';
  });

  ngOnInit(): void {
    this.companyService.list().subscribe({
      next: (res) => this.entreprises.set(res.data),
      error: () => {},
    });
    this.chargerStats();
  }

  chargerStats(): void {
    this.loading.set(true);
    this.statsService.get(this.selectedCompanyId ?? undefined).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
