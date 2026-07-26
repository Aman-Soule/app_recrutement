import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImagePreviewService {
  readonly imageUrl = signal<string | null>(null);

  /** Ouvre l'image en grand dans une modale superposée à toute la page */
  open(url: string): void {
    this.imageUrl.set(url);
  }

  close(): void {
    this.imageUrl.set(null);
  }
}
