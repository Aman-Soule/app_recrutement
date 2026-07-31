import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AiMatchScore } from '../../../models/application.model';
import { MatchScore } from '../match-score/match-score';

interface SousScore {
  label: string;
  valeur: number | null;
}

@Component({
  selector: 'app-ai-score-detail',
  imports: [MatchScore],
  templateUrl: './ai-score-detail.html',
  styleUrl: './ai-score-detail.scss',
})
export class AiScoreDetail {
  @Input({ required: true }) score: AiMatchScore | null | undefined;
  @Input() enAttente = false;
  @Input() erreur: string | null | undefined;
  /** Affiche un bouton "Réessayer" en cas d'échec (réservé à la page candidat, propriétaire de la candidature) */
  @Input() peutReessayer = false;
  @Input() relanceEnCours = false;
  @Output() reessayer = new EventEmitter<void>();

  sousScores(): SousScore[] {
    if (!this.score) return [];

    return [
      { label: 'Compétences', valeur: this.score.score_competences },
      { label: 'Expérience', valeur: this.score.score_experience },
      { label: 'Localisation', valeur: this.score.score_localisation },
      { label: 'Salaire', valeur: this.score.score_salaire },
    ].filter((s) => s.valeur !== null);
  }
}
