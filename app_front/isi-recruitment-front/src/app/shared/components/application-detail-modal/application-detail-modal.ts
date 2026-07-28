import { DatePipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { MessageService } from '../../../services/message.service';
import {
  Application,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';
import {
  LIBELLES_ETAPE_ENTRETIEN,
  LIBELLES_STATUT_ENTRETIEN,
} from '../../../models/interview.model';
import { AiScoreDetail } from '../ai-score-detail/ai-score-detail';

export type DetailModalRole = 'candidate' | 'recruiter';

@Component({
  selector: 'app-application-detail-modal',
  imports: [DatePipe, NgClass, FormsModule, RouterLink, AiScoreDetail],
  templateUrl: './application-detail-modal.html',
  styleUrl: './application-detail-modal.scss',
})
export class ApplicationDetailModal implements OnInit {
  private applicationService = inject(ApplicationService);
  private confirmDialog = inject(ConfirmDialogService);
  private messageService = inject(MessageService);

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

  async enregistrerStatut(): Promise<void> {
    const estDecisionForte = this.statutForm === 'rejete' || this.statutForm === 'embauche';
    const ok = await this.confirmDialog.confirm({
      title: 'Changer le statut de la candidature',
      message: estDecisionForte
        ? `Confirmer le passage de cette candidature au statut "${this.libelles[this.statutForm]}" ? Le candidat sera notifié par e-mail et cette décision est difficile à revenir dessus.`
        : `Confirmer le passage de cette candidature au statut "${this.libelles[this.statutForm]}" ? Le candidat sera notifié par e-mail.`,
      confirmLabel: 'Confirmer',
      danger: estDecisionForte,
    });
    if (!ok) return;

    this.saving.set(true);
    this.error.set(null);
    this.applicationService
      .changerStatut(this.application.id, this.statutForm, this.notesForm)
      .subscribe({
        next: ({ candidature }) => {
          this.saving.set(false);
          if (this.statutForm === 'embauche') {
            this.envoyerMessageEmbauche();
          }
          this.statutChange.emit({ ...this.application, ...candidature });
        },
        error: () => {
          this.saving.set(false);
          this.error.set("Impossible d'enregistrer le statut.");
        },
      });
  }

  /** Envoie automatiquement un message de félicitations au candidat lorsqu'il est recruté */
  private envoyerMessageEmbauche(): void {
    const destinataireId = this.application.candidat?.user_id;
    if (!destinataireId) return;

    const poste = this.application.offre?.titre ?? 'ce poste';
    const entreprise = this.application.offre?.entreprise?.nom;
    const contenu =
      `Félicitations ! Votre candidature pour le poste de "${poste}"` +
      (entreprise ? ` chez ${entreprise}` : '') +
      ` a été retenue : vous êtes recruté(e) ! Votre contrat de travail vous sera envoyé par e-mail dans les prochains jours. Bienvenue dans l'équipe !`;

    this.messageService.send(destinataireId, contenu, this.application.id).subscribe({ error: () => {} });
  }
}
