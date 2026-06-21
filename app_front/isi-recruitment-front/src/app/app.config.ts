import { ApplicationConfig } from '@angular/core';   // <-- AJOUTE CETTE LIGNE
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... autres providers
  ]
};