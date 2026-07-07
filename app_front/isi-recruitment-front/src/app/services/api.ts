import { HttpErrorResponse } from '@angular/common/http';

export const API_BASE_URL = 'http://127.0.0.1:8000/api';

/** Erreurs de validation Laravel : { message, errors: { champ: string[] } } */
export interface LaravelValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

/** Uniformise l'affichage des erreurs HTTP renvoyées par le backend Laravel */
export function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as LaravelValidationError | undefined;
    if (body?.errors) {
      const premiereErreur = Object.values(body.errors)[0]?.[0];
      if (premiereErreur) return premiereErreur;
    }
    if (body?.message) return body.message;
    if (err.status === 0) return 'Impossible de contacter le serveur.';
  }
  return 'Une erreur inattendue est survenue.';
}
