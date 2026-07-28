import { Component, Input } from '@angular/core';
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
