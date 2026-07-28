import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-match-score',
  imports: [NgClass],
  templateUrl: './match-score.html',
  styleUrl: './match-score.scss',
})
export class MatchScore {
  @Input({ required: true }) score: number | null = null;
  @Input() label?: string;
  @Input() variant: 'badge' | 'bar' = 'badge';

  badgeClass(): string {
    if (this.score === null) return 'badge-neutral';
    if (this.score >= 75) return 'badge-success';
    if (this.score >= 50) return 'badge-warning';
    return 'badge-danger';
  }

  barClass(): string {
    return this.badgeClass().replace('badge-', 'mini-progress__bar--');
  }

  texte(): string {
    return this.score === null ? '—' : `${this.label ? this.label + ' ' : ''}${this.score}%`;
  }
}
