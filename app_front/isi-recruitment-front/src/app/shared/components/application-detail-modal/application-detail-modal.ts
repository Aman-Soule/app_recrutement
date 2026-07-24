import { DatePipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';
import {
  LIBELLES_ETAPE_ENTRETIEN,
  LIBELLES_STATUT_ENTRETIEN,
} from '../../../models/interview.model';

export type DetailModalRole = 'candidate' | 'recruiter';

@Component({
  selector: 'app-application-detail-modal',
  imports: [DatePipe, NgClass, FormsModule, RouterLink],
  templateUrl: './application-detail-modal.html',
  styleUrl: './application-detail-modal.scss',
})
export class ApplicationDetailModal implements OnInit {
  private applicationService = inject(ApplicationService);

  @Input({ required: true }) application!: Application;
  @Input() role: DetailModalRole = 'candidate';

  @Output() close = new EventEmitter<void>();
  @Output() statutChange = new EventEmitter<Application>();

  readonly libelles = LIBELLES_STATUT_CANDIDATURE;
  readonly libellesEtape = LIBELLES_ETAPE_ENTRETIEN;
  readonly libellesStatutEntretien = LIBELLES_STATUT_ENTRETIEN;
  readonly statuts = Object.keys(LIBELLES_STATUT_CANDIDATURE) as StatutCandidature[];

  statutForm!: StatutCandidature;
  notesForm = '';

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.statutForm = this.application.statut;
    this.notesForm = this.application.notes_recruteur ?? '';
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

  enregistrerStatut(): void {
    this.saving.set(true);
    this.error.set(null);
    this.applicationService
      .changerStatut(this.application.id, this.statutForm, this.notesForm)
      .subscribe({
        next: ({ candidature }) => {
          this.saving.set(false);
          this.statutChange.emit({ ...this.application, ...candidature });
        },
        error: () => {
          this.saving.set(false);
          this.error.set("Impossible d'enregistrer le statut.");
        },
      });
  }
}
