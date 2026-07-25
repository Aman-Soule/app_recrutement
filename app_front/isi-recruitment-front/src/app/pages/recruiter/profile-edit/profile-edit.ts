import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RecruiterProfileService } from '../../../services/recruiter-profile.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-recruiter-profile-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit implements OnInit {
  private fb = inject(FormBuilder);
  private recruiterProfileService = inject(RecruiterProfileService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    titre: [''],
    telephone: [''],
  });

  ngOnInit(): void {
    this.recruiterProfileService.show().subscribe({
      next: (profil) => {
        this.profileForm.patchValue({ titre: profil.titre ?? '', telephone: profil.telephone ?? '' });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  annuler(): void {
    this.router.navigate(['/recruiter/settings']);
  }

  async enregistrer(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      message: 'Confirmer la modification de votre profil recruteur ?',
      confirmLabel: 'Enregistrer',
    });
    if (!ok) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    this.recruiterProfileService.update(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/recruiter/settings']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
