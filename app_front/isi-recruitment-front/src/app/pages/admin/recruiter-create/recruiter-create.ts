import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminRecruiterService } from '../../../services/admin-recruiter.service';
import { AdminCompanyService } from '../../../services/admin-company.service';
import { Company } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-admin-recruiter-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recruiter-create.html',
  styleUrl: './recruiter-create.scss',
})
export class RecruiterCreate implements OnInit {
  private fb = inject(FormBuilder);
  private recruiterService = inject(AdminRecruiterService);
  private companyService = inject(AdminCompanyService);

  readonly entreprises = signal<Company[]>([]);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<{ email: string; tempPassword: string } | null>(null);
  readonly nouvelleEntreprise = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company_id: [''],
    company_nom: [''],
    titre: [''],
    telephone: [''],
  });

  ngOnInit(): void {
    this.companyService.list().subscribe({
      next: (res) => this.entreprises.set(res.data),
      error: () => {},
    });
  }

  basculerNouvelleEntreprise(nouvelle: boolean): void {
    this.nouvelleEntreprise.set(nouvelle);
    this.form.patchValue({ company_id: '', company_nom: '' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();

    this.recruiterService
      .create({
        name: raw.name,
        email: raw.email,
        company_id: raw.company_id ? Number(raw.company_id) : undefined,
        company_nom: raw.company_nom || undefined,
        titre: raw.titre || undefined,
        telephone: raw.telephone || undefined,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.result.set({ email: res.user.email, tempPassword: res.temp_password });
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(extractErrorMessage(err));
        },
      });
  }

  copierMotDePasse(): void {
    const res = this.result();
    if (res) navigator.clipboard?.writeText(res.tempPassword);
  }
}
