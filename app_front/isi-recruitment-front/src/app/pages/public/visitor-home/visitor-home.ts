import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { AuthService } from '../../../services/auth';
import { JobOffer } from '../../../models/job.model';
import { PublicNavbar } from '../../../shared/components/public-navbar/public-navbar';

@Component({
  selector: 'app-visitor-home',
  imports: [FormsModule, RouterLink, PublicNavbar],
  templateUrl: './visitor-home.html',
  styleUrl: './visitor-home.scss',
})
export class VisitorHome implements OnInit {
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly offres = signal<JobOffer[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly total = signal(0);

  recherche = '';
  typeContrat = '';
  typeLieu = '';

  ngOnInit(): void {
    // Un utilisateur déjà connecté n'a pas besoin de revoir la page visiteur :
    // on le redirige directement vers son espace.
    if (this.authService.isLoggedIn()) {
      const role = this.authService.role();
      if (role) {
        this.router.navigate([`/${role}/dashboard`]);
        return;
      }
    }

    this.charger();
  }

  charger(page = 1): void {
    this.loading.set(true);
    this.jobService
      .list({
        statut: 'actif',
        recherche: this.recherche || undefined,
        type_contrat: this.typeContrat || undefined,
        type_lieu: this.typeLieu || undefined,
        page,
      })
      .subscribe({
        next: (res) => {
          this.offres.set(res.data);
          this.currentPage.set(res.current_page);
          this.lastPage.set(res.last_page);
          this.total.set(res.total ?? res.data.length);
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