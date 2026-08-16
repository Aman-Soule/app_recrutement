import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { InterviewService } from '../../../services/interview.service';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';

const COULEURS_STATUT: Record<StatutCandidature, string> = {
  nouveau: '#94a3b8',
  examen: '#60a5fa',
  preselection: '#a78bfa',
  entretien: '#2563eb',
  embauche: '#0d9488',
  rejete: '#dc2626',
};

@Component({
  selector: 'app-analytics',
  imports: [BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics implements OnInit {
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private interviewService = inject(InterviewService);

  readonly loading = signal(true);
  readonly offresActives = signal(0);
  readonly totalCandidatures = signal(0);
  readonly totalEntretiens = signal(0);
  readonly candidatures = signal<Application[]>([]);
  readonly libelles = LIBELLES_STATUT_CANDIDATURE;

  readonly repartitionStatutsChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const compteur = new Map<StatutCandidature, number>();
    for (const c of this.candidatures()) {
      compteur.set(c.statut, (compteur.get(c.statut) ?? 0) + 1);
    }
    const statuts = Array.from(compteur.keys());
    return {
      labels: statuts.map((s) => this.libelles[s]),
      datasets: [
        {
          data: statuts.map((s) => compteur.get(s) ?? 0),
          backgroundColor: statuts.map((s) => COULEURS_STATUT[s]),
          borderWidth: 0,
        },
      ],
    };
  });

  readonly doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  readonly scoreMoyen = computed(() => {
    const scores = this.candidatures()
      .map((c) => c.score_matching_ia)
      .filter((s): s is number => s !== null);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });

  ngOnInit(): void {
    this.jobService.list({ mine: true, statut: 'actif' }).subscribe({
      next: (res) => this.offresActives.set(res.total),
      error: () => {},
    });

    this.applicationService.pourRecruteur().subscribe({
      next: (res) => {
        this.candidatures.set(res.data);
        this.totalCandidatures.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.interviewService.index().subscribe({
      next: (entretiens) => this.totalEntretiens.set(entretiens.length),
      error: () => {},
    });
  }
}
