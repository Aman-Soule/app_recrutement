import { Component, inject } from '@angular/core';
import { ImagePreviewService } from '../../../services/image-preview.service';

@Component({
  selector: 'app-image-preview',
  imports: [],
  templateUrl: './image-preview.html',
  styleUrl: './image-preview.scss',
})
export class ImagePreview {
  private imagePreviewService = inject(ImagePreviewService);
  readonly imageUrl = this.imagePreviewService.imageUrl;

  fermer(): void {
    this.imagePreviewService.close();
  }
}
