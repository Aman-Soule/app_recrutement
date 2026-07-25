import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style d'alerte (rouge) pour les actions destructives/irréversibles */
  danger?: boolean;
}

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmState | null>(null);
  private resolver: ((result: boolean) => void) | null = null;

  /** Affiche une boîte modale de confirmation et résout `true`/`false` selon le choix de l'utilisateur */
  confirm(options: ConfirmOptions): Promise<boolean> {
    // Si une confirmation est déjà en attente, on l'annule pour éviter de perdre un resolver
    this.resolver?.(false);

    this.state.set({
      title: options.title ?? 'Confirmation',
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'Confirmer',
      cancelLabel: options.cancelLabel ?? 'Annuler',
      danger: options.danger ?? false,
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  respond(result: boolean): void {
    this.resolver?.(result);
    this.resolver = null;
    this.state.set(null);
  }
}
