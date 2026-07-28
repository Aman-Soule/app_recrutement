import { Component, Input } from '@angular/core';
import {
  ETAPES_CANDIDATURE,
  LIBELLES_STATUT_CANDIDATURE,
  StatutCandidature,
} from '../../../models/application.model';

type EtatEtape = 'complete' | 'courante' | 'a_venir';

@Component({
  selector: 'app-application-pipeline',
  imports: [],
  templateUrl: './application-pipeline.html',
  styleUrl: './application-pipeline.scss',
})
export class ApplicationPipeline {
  @Input({ required: true }) statut!: StatutCandidature;

  readonly etapes = ETAPES_CANDIDATURE;
  readonly libelles = LIBELLES_STATUT_CANDIDATURE;

  estRejete(): boolean {
    return this.statut === 'rejete';
  }

  estEmbauche(): boolean {
    return this.statut === 'embauche';
  }

  private indexActuel(): number {
    return this.etapes.indexOf(this.statut);
  }

  etatEtape(index: number): EtatEtape {
    if (this.estEmbauche()) return 'complete';
    if (this.estRejete()) return index === 0 ? 'complete' : 'a_venir';

    const courant = this.indexActuel();
    if (index < courant) return 'complete';
    if (index === courant) return 'courante';
    return 'a_venir';
  }
}
