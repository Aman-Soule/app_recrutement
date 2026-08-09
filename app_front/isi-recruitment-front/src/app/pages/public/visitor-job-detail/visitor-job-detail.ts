import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { JobOffer } from '../../../models/job.model';
import { PublicNavbar } from '../../../shared/components/public-navbar/public-navbar';

@Component({
  selector: 'app-visitor-job-detail',
  imports: [RouterLink, PublicNavbar],
  templateUrl: './visitor-job-detail.html',
  styleUrl: './visitor-job-detail.scss',
})
export class VisitorJobDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);

  readonly offre = signal<JobOffer | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.get(id).subscribe({
      next: (offre) => {
        this.offre.set(offre);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}