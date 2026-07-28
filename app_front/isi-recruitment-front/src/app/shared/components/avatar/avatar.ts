import { Component, inject, Input } from '@angular/core';
import { ImagePreviewService } from '../../../services/image-preview.service';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  readonly imagePreview = inject(ImagePreviewService);

  @Input() url: string | null = null;
  @Input({ required: true }) name = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() clickable = true;

  initiales(): string {
    const nom = this.name ?? '';
    return nom
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((partie) => partie[0]?.toUpperCase())
      .join('');
  }

  ouvrirApercu(): void {
    if (this.clickable && this.url) {
      this.imagePreview.open(this.url);
    }
  }
}
