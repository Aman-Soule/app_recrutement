import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { InterviewService } from '../../../services/interview.service';
import { ApplicationService } from '../../../services/application.service';
import {
  Interview,
  LIBELLES_ETAPE_ENTRETIEN,
  LIBELLES_STATUT_ENTRETIEN,
} from '../../../models/interview.model';
import { Application } from '../../../models/application.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-interviews',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './interviews.html',
  styleUrl: './interviews.scss',
})
export class Interviews implements OnInit {
  private fb = inject(FormBuilder);
  private interviewService = inject(InterviewService);
  private applicationService = inject(ApplicationService);

  readonly entretiens = signal<Interview[]>([]);
  readonly candidatures = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackTarget = signal<Interview | null>(null);

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

  ngOnInit(): void {
    this.charger();
    this.applicationService.pourRecruteur().subscribe({
      next: (res) => this.candidatures.set(res.data),
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

  ouvrirCreation(): void {
    this.form.reset({
      application_id: this.candidatures()[0]?.id ?? 0,
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

  enregistrerFeedback(): void {
    const cible = this.feedbackTarget();
    if (!cible) return;

    const valeurs = this.feedbackForm.getRawValue();
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
        },
        error: (err) => this.errorMessage.set(extractErrorMessage(err)),
      });
  }

  libelleCandidature(candidature: Application): string {
    return `${candidature.candidat?.utilisateur?.name ?? 'Candidat'} — ${candidature.offre?.titre ?? ''}`;
  }
}
