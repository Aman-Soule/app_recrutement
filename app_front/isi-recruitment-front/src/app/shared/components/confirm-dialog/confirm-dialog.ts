import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  private confirmDialogService = inject(ConfirmDialogService);
  readonly state = this.confirmDialogService.state;

  confirmer(): void {
    this.confirmDialogService.respond(true);
  }

  annuler(): void {
    this.confirmDialogService.respond(false);
  }
}
