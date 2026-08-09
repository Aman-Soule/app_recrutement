import { DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

export type MatchingModalPhase = 'calculating' | 'done' | 'error';

const RAYON = 54;
const CIRCONFERENCE = 2 * Math.PI * RAYON;

@Component({
  selector: 'app-matching-modal',
  imports: [NgClass, DecimalPipe],
  templateUrl: './matching-modal.html',
  styleUrl: './matching-modal.scss',
})
export class MatchingModal implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() phase: MatchingModalPhase = 'calculating';
  @Input() score: number | null = null;
  @Input() matched: string[] = [];
  @Input() missing: string[] = [];
  @Input() resume: string | null = null;
  @Input() offreTitre = '';

  @Output() closed = new EventEmitter<void>();

  readonly circonference = CIRCONFERENCE;
  displayScore = 0;
  justRevealed = false;

  private rampTimer: ReturnType<typeof setInterval> | null = null;
  private settleFrame: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['phase'] || changes['open']) {
      if (this.phase === 'calculating' && this.open) {
        this.demarrerRampe();
      } else if (this.phase === 'done' && this.score !== null) {
        this.arreterRampe();
        this.animerVersScoreFinal(this.score);
      } else if (this.phase === 'error') {
        this.arreterRampe();
      }
    }
  }

  ngOnDestroy(): void {
    this.arreterRampe();
    if (this.settleFrame !== null) cancelAnimationFrame(this.settleFrame);
  }

  fermer(): void {
    this.closed.emit();
  }

  dashoffset(): number {
    return this.circonference * (1 - Math.min(this.displayScore, 100) / 100);
  }

  couleurClasse(): string {
    if (this.phase === 'calculating') return 'ring-progress';
    if (this.phase === 'error') return 'ring-error';
    if (this.score === null) return 'ring-neutral';
    if (this.score >= 75) return 'ring-success';
    if (this.score >= 50) return 'ring-warning';
    return 'ring-danger';
  }

  messageStatut(): string {
    if (this.phase === 'calculating') return "Analyse du CV et du profil par l'IA...";
    if (this.phase === 'error') return 'Le calcul du score a rencontré un problème.';
    if (this.score === null) return 'Score en cours de calcul.';
    if (this.score >= 75) return 'Excellente correspondance !';
    if (this.score >= 50) return 'Bonne correspondance.';
    return 'Correspondance partielle.';
  }

  /** Montée progressive et sans fin (asymptotique vers 92%) pendant le calcul réel côté serveur */
  private demarrerRampe(): void {
    this.arreterRampe();
    this.displayScore = 0;
    this.justRevealed = false;
    this.rampTimer = setInterval(() => {
      const cible = 92;
      this.displayScore += (cible - this.displayScore) * 0.06;
    }, 60);
  }

  private arreterRampe(): void {
    if (this.rampTimer !== null) {
      clearInterval(this.rampTimer);
      this.rampTimer = null;
    }
  }

  /** Anime le pourcentage affiché depuis sa valeur courante jusqu'au score réel reçu du serveur */
  private animerVersScoreFinal(cible: number): void {
    const depart = this.displayScore;
    const duree = 900;
    const debut = performance.now();

    const tick = (maintenant: number) => {
      const t = Math.min(1, (maintenant - debut) / duree);
      const ease = 1 - Math.pow(1 - t, 3);
      this.displayScore = depart + (cible - depart) * ease;

      if (t < 1) {
        this.settleFrame = requestAnimationFrame(tick);
      } else {
        this.displayScore = cible;
        this.justRevealed = true;
      }
    };

    this.settleFrame = requestAnimationFrame(tick);
  }
}
