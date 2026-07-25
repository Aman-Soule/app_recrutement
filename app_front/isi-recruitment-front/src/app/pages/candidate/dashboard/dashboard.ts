import { NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { ApplicationService } from '../../../services/application.service';
import { JobService } from '../../../services/job.service';
import { MessageService } from '../../../services/message.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { CandidateProfile, NiveauCompetence } from '../../../models/user.model';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';
import { JobOffer } from '../../../models/job.model';
import { extractErrorMessage } from '../../../services/api';

const NIVEAUX: NiveauCompetence[] = ['debutant', 'intermediaire', 'avance', 'expert'];
const LIBELLES_NIVEAU: Record<NiveauCompetence, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  expert: 'Expert',
};

const NOMBRE_CANDIDATURES_RECENTES = 4;
const NOMBRE_OFFRES_RECOMMANDEES = 4;

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, BaseChartDirective, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private candidateProfileService = inject(CandidateProfileService);
  private applicationService = inject(ApplicationService);
  private jobService = inject(JobService);
  private messageService = inject(MessageService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly profil = signal<CandidateProfile | null>(null);
  readonly candidatures = signal<Application[]>([]);
  readonly offresRecommandees = signal<JobOffer[]>([]);
  readonly messagesNonLus = signal(0);
  readonly postulationEnCours = signal<number | null>(null);
  readonly erreurPostulation = signal<string | null>(null);

  readonly libelles = LIBELLES_STATUT_CANDIDATURE;

  readonly candidaturesRecentes = computed(() =>
    this.candidatures().slice(0, NOMBRE_CANDIDATURES_RECENTES),
  );

  readonly competencesVerifiees = computed(
    () => this.profil()?.competences?.filter((c) => c.pivot?.verifie) ?? [],
  );

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
      next: (candidatures) => this.candidatures.set(candidatures),
      error: () => {},
    });

    this.chargerOffresRecommandees();

    this.messageService.nonLus().subscribe({
      next: (res) => this.messagesNonLus.set(res.non_lus),
      error: () => {},
    });
  }

  private chargerOffresRecommandees(): void {
    this.jobService.recommandees().subscribe({
      next: (offres) => this.offresRecommandees.set(offres.slice(0, NOMBRE_OFFRES_RECOMMANDEES)),
      error: () => {},
    });
  }

  async postuler(offre: JobOffer): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Envoyer ma candidature',
      message: `Confirmer l'envoi de votre candidature pour "${offre.titre}" chez ${offre.entreprise?.nom ?? "l'entreprise"} ? Vous ne pourrez pas la retirer une fois envoyée.`,
      confirmLabel: 'Envoyer ma candidature',
    });
    if (!ok) return;

    this.postulationEnCours.set(offre.id);
    this.erreurPostulation.set(null);

    this.applicationService
      .postuler(offre.id, { cv_url: this.profil()?.cv_url ?? undefined })
      .subscribe({
        next: (res) => {
          this.candidatures.update((liste) => [res.candidature, ...liste]);
          this.offresRecommandees.update((offres) => offres.filter((o) => o.id !== offre.id));
          this.postulationEnCours.set(null);
        },
        error: (err) => {
          this.erreurPostulation.set(extractErrorMessage(err));
          this.postulationEnCours.set(null);
        },
      });
  }

  badgeClass(statut: StatutCandidature): string {
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
