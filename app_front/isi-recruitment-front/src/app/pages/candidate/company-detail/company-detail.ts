import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { CompanyWithOffres } from '../../../models/job.model';

@Component({
  selector: 'app-company-detail',
  imports: [RouterLink],
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.scss',
})
export class CompanyDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly entreprise = signal<CompanyWithOffres | null>(null);

  readonly libellesTaille: Record<string, string> = {
    startup: 'Startup',
    pme: 'PME',
    grand_groupe: 'Grand groupe',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.companyService.show(id).subscribe({
      next: (entreprise) => {
        this.entreprise.set(entreprise as CompanyWithOffres);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les informations de cette entreprise.');
        this.loading.set(false);
      },
    });
  }
}
