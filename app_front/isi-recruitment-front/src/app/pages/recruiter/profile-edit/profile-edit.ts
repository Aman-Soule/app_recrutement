import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RecruiterProfileService } from '../../../services/recruiter-profile.service';
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

  enregistrer(): void {
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
