import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { AuthService } from '../../../services/auth';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { ImagePreviewService } from '../../../services/image-preview.service';
import { CandidateProfile, NiveauCompetence, Skill } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private candidateProfileService = inject(CandidateProfileService);
  private authService = inject(AuthService);
  private confirmDialog = inject(ConfirmDialogService);
  readonly imagePreview = inject(ImagePreviewService);
  readonly currentUser = this.authService.currentUser;

  readonly loading = signal(true);
  readonly uploadingAvatar = signal(false);
  readonly uploadingCv = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly profil = signal<CandidateProfile | null>(null);

  readonly competences = computed<(Skill & { niveau: NiveauCompetence })[]>(
    () => this.profil()?.competences?.map((c) => ({ ...c, niveau: c.pivot?.niveau ?? 'intermediaire' })) ?? [],
  );

  readonly libellesDisponibilite: Record<CandidateProfile['disponibilite'], string> = {
    disponible: 'Disponible',
    a_lecoute: "À l'écoute d'opportunités",
    non_disponible: 'Non disponible',
  };

  readonly libellesContrat: Record<string, string> = {
    temps_plein: 'Temps plein',
    temps_partiel: 'Temps partiel',
    freelance: 'Freelance',
    stage: 'Stage',
  };

  readonly libellesLieu: Record<string, string> = {
    teletravail: 'Télétravail',
    hybride: 'Hybride',
    presentiel: 'Présentiel',
  };

  ngOnInit(): void {
    this.candidateProfileService.show().subscribe({
      next: (profil) => {
        this.profil.set(profil);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  async surAvatarSelectionne(event: Event): Promise<void> {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (!fichier) return;

    const ok = await this.confirmDialog.confirm({
      message: 'Remplacer votre photo de profil actuelle par cette image ?',
      confirmLabel: 'Remplacer',
    });
    if (!ok) return;

    this.uploadingAvatar.set(true);
    this.errorMessage.set(null);
    this.candidateProfileService.uploadAvatar(fichier).subscribe({
      next: (res) => {
        this.profil.set({ ...this.profil(), ...res.profil });
        this.uploadingAvatar.set(false);
        this.authService.me().subscribe();
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  async surCvSelectionne(event: Event): Promise<void> {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (!fichier) return;

    const ok = await this.confirmDialog.confirm({
      message: 'Remplacer votre CV actuel par ce fichier ?',
      confirmLabel: 'Remplacer',
    });
    if (!ok) return;

    this.uploadingCv.set(true);
    this.errorMessage.set(null);
    this.candidateProfileService.uploadCv(fichier).subscribe({
      next: (res) => {
        this.profil.set({ ...this.profil(), ...res.profil });
        this.uploadingCv.set(false);
      },
      error: (err) => {
        this.uploadingCv.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
