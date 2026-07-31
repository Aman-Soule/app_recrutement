import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { InterviewService } from '../../../services/interview.service';
import { AuthService } from '../../../services/auth';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';
import { Interview } from '../../../models/interview.model';
import { ApplicationDetailModal } from '../../../shared/components/application-detail-modal/application-detail-modal';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, NgClass, RouterLink, BaseChartDirective, ApplicationDetailModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private interviewService = inject(InterviewService);
  private authService = inject(AuthService);

  readonly libelles = LIBELLES_STATUT_CANDIDATURE;

  readonly prenom = computed(() => {
    const nom = this.authService.currentUser()?.name;
    return nom ? nom.split(' ')[0] : '';
  });

  readonly offresActives = signal(0);
  readonly offresBrouillons = signal(0);
  readonly totalCandidats = signal(0);
  readonly candidatures = signal<Application[]>([]);
  readonly entretiens = signal<Interview[]>([]);
  readonly selectedCandidature = signal<Application | null>(null);

  readonly candidaturesRecentes = computed(() => this.candidatures().slice(0, 5));

  readonly entretiensAujourdhui = computed(
    () => this.entretiens().filter((e) => this.estAujourdhui(e.planifie_le)).length,
  );

  readonly prochainsEntretiens = computed(() =>
    this.entretiens()
      .filter((e) => new Date(e.planifie_le).getTime() >= Date.now())
      .slice(0, 4),
  );

  readonly candidaturesParStatutChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const statuts = Object.keys(this.libelles) as StatutCandidature[];
    const compteur = new Map<StatutCandidature, number>();
    for (const c of this.candidatures()) {
      compteur.set(c.statut, (compteur.get(c.statut) ?? 0) + 1);
    }
    return {
      labels: statuts.map((s) => this.libelles[s]),
      datasets: [
        {
          data: statuts.map((s) => compteur.get(s) ?? 0),
          backgroundColor: '#2563eb',
          borderRadius: 6,
          maxBarThickness: 32,
        },
      ],
    };
  });

  readonly entretiensParJourChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const jours: { cle: string; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      jours.push({
        cle: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      });
    }
    const compteur = new Map<string, number>();
    for (const e of this.entretiens()) {
      const cle = e.planifie_le.slice(0, 10);
      compteur.set(cle, (compteur.get(cle) ?? 0) + 1);
    }
    return {
      labels: jours.map((j) => j.label),
      datasets: [
        {
          data: jours.map((j) => compteur.get(j.cle) ?? 0),
          backgroundColor: '#2563eb',
          borderRadius: 6,
          maxBarThickness: 32,
        },
      ],
    };
  });

  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  ngOnInit(): void {
    this.jobService.list({ mine: true, statut: 'actif' }).subscribe({
      next: (res) => {
        this.offresActives.set(res.total);
        this.totalCandidats.set(res.data.reduce((somme, o) => somme + o.nombre_candidats, 0));
      },
      error: () => {},
    });

    this.jobService.list({ mine: true, statut: 'brouillon' }).subscribe({
      next: (res) => this.offresBrouillons.set(res.total),
      error: () => {},
    });

    this.applicationService.pourRecruteur().subscribe({
      next: (res) => this.candidatures.set(res.data),
      error: () => {},
    });

    this.interviewService.index().subscribe({
      next: (entretiens) => this.entretiens.set(entretiens),
      error: () => {},
    });
  }

  onStatutChange(updated: Application): void {
    this.candidatures.update((liste) =>
      liste.map((c) => (c.id === updated.id ? updated : c)),
    );
    this.selectedCandidature.set(updated);
  }

  private estAujourdhui(dateIso: string): boolean {
    const date = new Date(dateIso);
    const aujourdhui = new Date();
    return (
      date.getFullYear() === aujourdhui.getFullYear() &&
      date.getMonth() === aujourdhui.getMonth() &&
      date.getDate() === aujourdhui.getDate()
    );
  }

  badgeClass(statut: string): string {
    switch (statut) {
      case 'embauche':
        return 'badge-success';
      case 'rejete':
        return 'badge-danger';
      case 'entretien':
      case 'offre_envoyee':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  }
}
