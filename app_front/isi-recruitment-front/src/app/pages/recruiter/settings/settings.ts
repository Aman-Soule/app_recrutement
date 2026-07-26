import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecruiterProfileService } from '../../../services/recruiter-profile.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { ImagePreviewService } from '../../../services/image-preview.service';
import { RecruiterProfile } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-settings',
  imports: [RouterLink],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private recruiterProfileService = inject(RecruiterProfileService);
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private confirmDialog = inject(ConfirmDialogService);
  readonly imagePreview = inject(ImagePreviewService);

  readonly onglet = signal<'entreprise' | 'profil'>('entreprise');
  readonly loading = signal(true);
  readonly uploadingLogo = signal(false);
  readonly uploadingAvatar = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly profil = signal<RecruiterProfile | null>(null);

  readonly libellesTaille: Record<string, string> = {
    startup: 'Startup',
    pme: 'PME',
    grand_groupe: 'Grand groupe',
  };

  ngOnInit(): void {
    this.recruiterProfileService.show().subscribe({
      next: (profil) => {
        this.profil.set(profil);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changerOnglet(onglet: 'entreprise' | 'profil'): void {
    this.onglet.set(onglet);
  }

  async surLogoSelectionne(event: Event): Promise<void> {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    const companyId = this.profil()?.entreprise?.id;
    if (!fichier || !companyId) return;

    const ok = await this.confirmDialog.confirm({
      message: "Remplacer le logo actuel de l'entreprise par cette image ?",
      confirmLabel: 'Remplacer',
    });
    if (!ok) return;

    this.uploadingLogo.set(true);
    this.errorMessage.set(null);
    this.companyService.uploadLogo(companyId, fichier).subscribe({
      next: (res) => {
        this.profil.update((p) => (p ? { ...p, entreprise: res.entreprise } : p));
        this.uploadingLogo.set(false);
      },
      error: (err) => {
        this.uploadingLogo.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
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
    this.recruiterProfileService.uploadAvatar(fichier).subscribe({
      next: (res) => {
        this.profil.set(res.profil);
        this.uploadingAvatar.set(false);
        this.authService.me().subscribe();
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
