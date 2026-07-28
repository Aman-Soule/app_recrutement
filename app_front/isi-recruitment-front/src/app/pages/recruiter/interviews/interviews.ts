import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewService } from '../../../services/interview.service';
import { ApplicationService } from '../../../services/application.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import {
  Interview,
  LIBELLES_ETAPE_ENTRETIEN,
  LIBELLES_STATUT_ENTRETIEN,
} from '../../../models/interview.model';
import { Application } from '../../../models/application.model';
import { extractErrorMessage } from '../../../services/api';
import { ApplicationDetailModal } from '../../../shared/components/application-detail-modal/application-detail-modal';

@Component({
  selector: 'app-interviews',
  imports: [ReactiveFormsModule, DatePipe, ApplicationDetailModal],
  templateUrl: './interviews.html',
  styleUrl: './interviews.scss',
})
export class Interviews implements OnInit {
  private fb = inject(FormBuilder);
  private interviewService = inject(InterviewService);
  private applicationService = inject(ApplicationService);
  private confirmDialog = inject(ConfirmDialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly entretiens = signal<Interview[]>([]);
  readonly candidatures = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackTarget = signal<Interview | null>(null);
  readonly preselectedApplicationId = signal<number | null>(null);
  readonly selectedCandidature = signal<Application | null>(null);

  readonly libellesEtape = LIBELLES_ETAPE_ENTRETIEN;
  readonly libellesStatut = LIBELLES_STATUT_ENTRETIEN;

  readonly form = this.fb.nonNullable.group({
    application_id: [0],
    type: ['video'],
    etape: ['rh'],
    planifie_le: [''],
    duree_minutes: [60],
    lieu_ou_lien: [''],
  });

  readonly feedbackForm = this.fb.nonNullable.group({
    note: [3],
    feedback: [''],
    statut: ['termine'],
  });

  readonly aVenir = computed(() =>
    this.entretiens().filter((e) => new Date(e.planifie_le).getTime() >= Date.now()),
  );

  readonly passes = computed(() =>
    this.entretiens().filter((e) => new Date(e.planifie_le).getTime() < Date.now()),
  );

  readonly candidatureSelectionnee = computed(() => {
    const id = this.preselectedApplicationId();
    return id ? (this.candidatures().find((c) => c.id === id) ?? null) : null;
  });

  ngOnInit(): void {
    this.charger();

    const applicationIdParam = this.route.snapshot.queryParamMap.get('applicationId');
    const applicationId = applicationIdParam ? Number(applicationIdParam) : null;

    this.applicationService.pourRecruteur().subscribe({
      next: (res) => {
        this.candidatures.set(res.data);
        if (applicationId) {
          this.ouvrirCreation(applicationId);
          this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
        }
      },
      error: () => {},
    });
  }

  charger(): void {
    this.loading.set(true);
    this.interviewService.index().subscribe({
      next: (entretiens) => {
        this.entretiens.set(entretiens);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ouvrirCreation(applicationId?: number): void {
    this.preselectedApplicationId.set(applicationId ?? null);
    this.form.reset({
      application_id: applicationId ?? this.candidatures()[0]?.id ?? 0,
      type: 'video',
      etape: 'rh',
      planifie_le: '',
      duree_minutes: 60,
      lieu_ou_lien: '',
    });
    this.errorMessage.set(null);
    this.showForm.set(true);
  }

  annuler(): void {
    this.showForm.set(false);
    this.errorMessage.set(null);
  }

  enregistrer(): void {
    const { application_id, planifie_le, ...reste } = this.form.getRawValue();
    if (!application_id) {
      this.errorMessage.set('Sélectionnez une candidature.');
      return;
    }
    if (!planifie_le) {
      this.errorMessage.set('Choisissez une date.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.interviewService
      .store(application_id, { ...reste, planifie_le: new Date(planifie_le).toISOString() })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.charger();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(extractErrorMessage(err));
        },
      });
  }

  ouvrirFeedback(entretien: Interview): void {
    this.feedbackTarget.set(entretien);
    this.feedbackForm.reset({
      note: entretien.note ?? 3,
      feedback: entretien.feedback ?? '',
      statut: 'termine',
    });
  }

  fermerFeedback(): void {
    this.feedbackTarget.set(null);
  }

  async enregistrerFeedback(): Promise<void> {
    const cible = this.feedbackTarget();
    if (!cible) return;

    const valeurs = this.feedbackForm.getRawValue();
    const annulation = valeurs.statut === 'annule';

    const ok = await this.confirmDialog.confirm({
      title: annulation ? "Annuler l'entretien" : "Enregistrer le feedback",
      message: annulation
        ? "Annuler cet entretien ? Cette action est difficile à revenir dessus."
        : 'Confirmer l\'enregistrement de ce feedback ?',
      confirmLabel: annulation ? "Annuler l'entretien" : 'Enregistrer',
      cancelLabel: annulation ? 'Retour' : 'Annuler',
      danger: annulation,
    });
    if (!ok) return;

    this.interviewService
      .feedback(cible.id, {
        note: valeurs.note,
        feedback: valeurs.feedback,
        statut: valeurs.statut as 'termine' | 'annule',
      })
      .subscribe({
        next: () => {
          this.feedbackTarget.set(null);
          this.charger();
          // Après un entretien terminé, on invite directement le recruteur à statuer sur la candidature.
          if (valeurs.statut === 'termine' && cible.candidature) {
            this.selectedCandidature.set(cible.candidature);
          }
        },
        error: (err) => this.errorMessage.set(extractErrorMessage(err)),
      });
  }

  changerStatutCandidature(entretien: Interview): void {
    if (entretien.candidature) {
      this.selectedCandidature.set(entretien.candidature);
    }
  }

  onStatutChange(updated: Application): void {
    this.entretiens.update((liste) =>
      liste.map((e) => (e.candidature?.id === updated.id ? { ...e, candidature: updated } : e)),
    );
    this.selectedCandidature.set(updated);
  }

  libelleCandidature(candidature: Application): string {
    return `${candidature.candidat?.utilisateur?.name ?? 'Candidat'} — ${candidature.offre?.titre ?? ''}`;
  }
}
