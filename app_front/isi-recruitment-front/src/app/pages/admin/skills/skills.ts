import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../../../services/skill.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { Skill } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-admin-skills',
  imports: [FormsModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills implements OnInit {
  private skillService = inject(SkillService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly competences = signal<Skill[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  recherche = '';

  nouvelleCompetence = '';
  nouvelleCategorie = '';

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading.set(true);
    this.skillService.list(this.recherche || undefined).subscribe({
      next: (competences) => {
        this.competences.set(competences);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ajouter(): void {
    const nom = this.nouvelleCompetence.trim();
    if (!nom) return;

    this.creating.set(true);
    this.errorMessage.set(null);
    this.skillService.create(nom, this.nouvelleCategorie.trim() || undefined).subscribe({
      next: (res) => {
        this.competences.update((list) => [...list, res.competence]);
        this.nouvelleCompetence = '';
        this.nouvelleCategorie = '';
        this.creating.set(false);
      },
      error: (err) => {
        this.creating.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  async supprimer(competence: Skill): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Supprimer la compétence',
      message: `Supprimer "${competence.nom}" du référentiel ? Elle sera retirée des profils qui l'utilisent.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    this.errorMessage.set(null);
    this.skillService.remove(competence.id).subscribe({
      next: () => this.competences.update((list) => list.filter((c) => c.id !== competence.id)),
      error: (err) => this.errorMessage.set(extractErrorMessage(err)),
    });
  }
}
