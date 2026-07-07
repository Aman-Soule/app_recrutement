import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MessageService } from '../../services/message.service';
import { LayoutUiService } from '../../services/layout-ui.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private auth = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  readonly layoutUi = inject(LayoutUiService);

  readonly user = this.auth.currentUser;
  readonly nonLus = signal(0);

  readonly avatarUrl = computed(
    () => this.user()?.profil_candidat?.avatar_url ?? this.user()?.profil_recruteur?.avatar_url ?? null,
  );

  readonly initiales = computed(() => {
    const nom = this.user()?.name ?? '';
    return nom
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((partie) => partie[0]?.toUpperCase())
      .join('');
  });

  readonly libelleRole = computed(() =>
    this.user()?.role === 'recruiter' ? 'Recruteur' : 'Candidat',
  );

  ngOnInit(): void {
    this.messageService.nonLus().subscribe({
      next: (res) => this.nonLus.set(res.non_lus),
      error: () => {
        /* pas bloquant pour l'affichage de l'en-tête */
      },
    });
  }

  seDeconnecter(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
