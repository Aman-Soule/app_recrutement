import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { ApplicationService } from '../../../services/application.service';
import { JobService } from '../../../services/job.service';
import { MessageService } from '../../../services/message.service';
import { CandidateProfile, NiveauCompetence } from '../../../models/user.model';
import {
  Application,
  ETAPES_CANDIDATURE,
  LIBELLES_STATUT_CANDIDATURE,
} from '../../../models/application.model';
import { JobOffer } from '../../../models/job.model';

const NIVEAUX: NiveauCompetence[] = ['debutant', 'intermediaire', 'avance', 'expert'];
const LIBELLES_NIVEAU: Record<NiveauCompetence, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  expert: 'Expert',
};

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private candidateProfileService = inject(CandidateProfileService);
  private applicationService = inject(ApplicationService);
  private jobService = inject(JobService);
  private messageService = inject(MessageService);

  readonly profil = signal<CandidateProfile | null>(null);
  readonly candidatureActive = signal<Application | null>(null);
  readonly offresRecommandees = signal<JobOffer[]>([]);
  readonly messagesNonLus = signal(0);
  readonly postulationEnCours = signal<number | null>(null);

  readonly etapes = ETAPES_CANDIDATURE;
  readonly libelles = LIBELLES_STATUT_CANDIDATURE;

  readonly competencesVerifiees = computed(
    () => this.profil()?.competences?.filter((c) => c.pivot?.verifie) ?? [],
  );

  readonly etapeActiveIndex = computed(() => {
    const statut = this.candidatureActive()?.statut;
    if (!statut) return -1;
    return this.etapes.indexOf(statut);
  });

  readonly forceProfilChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const force = this.profil()?.force_profil ?? 0;
    return {
      labels: ['Complété', 'Restant'],
      datasets: [
        {
          data: [force, 100 - force],
          backgroundColor: ['#2563eb', '#e2e8f0'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly forceProfilChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: { legend: { display: false } },
  };

  readonly competencesChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const competences = this.profil()?.competences ?? [];
    const compteur = new Map<NiveauCompetence, number>(NIVEAUX.map((n) => [n, 0]));
    for (const c of competences) {
      const niveau = c.pivot?.niveau ?? 'intermediaire';
      compteur.set(niveau, (compteur.get(niveau) ?? 0) + 1);
    }
    return {
      labels: NIVEAUX.map((n) => LIBELLES_NIVEAU[n]),
      datasets: [
        {
          data: NIVEAUX.map((n) => compteur.get(n) ?? 0),
          backgroundColor: '#2563eb',
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    };
  });

  readonly competencesChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  ngOnInit(): void {
    this.candidateProfileService.show().subscribe({
      next: (profil) => this.profil.set(profil),
      error: () => {},
    });

    this.applicationService.mesCandidatures().subscribe({
      next: (candidatures) => this.candidatureActive.set(candidatures[0] ?? null),
      error: () => {},
    });

    this.jobService.recommandees().subscribe({
      next: (offres) => this.offresRecommandees.set(offres.slice(0, 3)),
      error: () => {},
    });

    this.messageService.nonLus().subscribe({
      next: (res) => this.messagesNonLus.set(res.non_lus),
      error: () => {},
    });
  }

  postuler(offre: JobOffer): void {
    this.postulationEnCours.set(offre.id);
    this.applicationService.postuler(offre.id).subscribe({
      next: () => {
        this.offresRecommandees.update((offres) => offres.filter((o) => o.id !== offre.id));
        this.postulationEnCours.set(null);
      },
      error: () => this.postulationEnCours.set(null),
    });
  }
}
