import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  readonly onglet = signal<'infos' | 'password'>('infos');
  readonly savingInfos = signal(false);
  readonly savingPassword = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly infosForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  constructor() {
    const user = this.authService.currentUser();
    this.infosForm.patchValue({ name: user?.name ?? '', email: user?.email ?? '' });
  }

  changerOnglet(onglet: 'infos' | 'password'): void {
    this.onglet.set(onglet);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  retour(): void {
    this.router.navigate([this.pageRetour()]);
  }

  private pageRetour(): string {
    return this.authService.role() === 'recruiter' ? '/recruiter/settings' : '/candidate/profile';
  }

  async enregistrerInfos(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      message: 'Confirmer la modification de vos informations personnelles ?',
      confirmLabel: 'Enregistrer',
    });
    if (!ok) return;

    this.savingInfos.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.updateAccount(this.infosForm.getRawValue()).subscribe({
      next: () => {
        this.savingInfos.set(false);
        this.router.navigate([this.pageRetour()]);
      },
      error: (err) => {
        this.savingInfos.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  async enregistrerPassword(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Changer de mot de passe',
      message: 'Confirmer le changement de votre mot de passe ? Vous devrez utiliser le nouveau mot de passe lors de votre prochaine connexion.',
      confirmLabel: 'Changer le mot de passe',
      danger: true,
    });
    if (!ok) return;

    this.savingPassword.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.updatePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.router.navigate([this.pageRetour()]);
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
