import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { ImagePreviewService } from '../../../services/image-preview.service';
import { CandidateProfile, NiveauCompetence, Skill } from '../../../models/user.model';
import { Application, LIBELLES_STATUT_CANDIDATURE, StatutCandidature } from '../../../models/application.model';

@Component({
  selector: 'app-candidate-detail',
  imports: [RouterLink, NgClass, DatePipe],
  templateUrl: './candidate-detail.html',
  styleUrl: './candidate-detail.scss',
})
export class CandidateDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidateProfileService = inject(CandidateProfileService);
  readonly imagePreview = inject(ImagePreviewService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profil = signal<CandidateProfile | null>(null);
  readonly candidatures = signal<Application[]>([]);

  readonly libelles = LIBELLES_STATUT_CANDIDATURE;

  readonly competences = computed<(Skill & { niveau: NiveauCompetence })[]>(
    () => this.profil()?.competences?.map((c) => ({ ...c, niveau: c.pivot?.niveau ?? 'intermediaire' })) ?? [],
  );

  readonly libellesDisponibilite: Record<CandidateProfile['disponibilite'], string> = {
    disponible: 'Disponible',
    a_lecoute: "À l'écoute d'opportunités",
    non_disponible: 'Non disponible',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.candidateProfileService.getById(id).subscribe({
      next: (res) => {
        this.profil.set(res.profil);
        this.candidatures.set(res.candidatures);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.status === 403
            ? "Vous n'avez pas accès au profil de ce candidat."
            : 'Impossible de charger ce profil.',
        );
        this.loading.set(false);
      },
    });
  }

  planifierEntretien(candidature: Application): void {
    this.router.navigate(['/recruiter/interviews'], { queryParams: { applicationId: candidature.id } });
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
