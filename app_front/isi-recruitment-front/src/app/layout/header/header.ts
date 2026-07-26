import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MessageService } from '../../services/message.service';
import { NotificationService } from '../../services/notification.service';
import { LayoutUiService } from '../../services/layout-ui.service';
import { ImagePreviewService } from '../../services/image-preview.service';
import { AppNotification } from '../../models/notification.model';

const INTERVALLE_POLLING_MS = 45000;

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private messageService = inject(MessageService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  readonly layoutUi = inject(LayoutUiService);
  readonly imagePreview = inject(ImagePreviewService);

  readonly user = this.auth.currentUser;
  readonly nonLus = signal(0);

  readonly notifications = signal<AppNotification[]>([]);
  readonly notificationsNonLues = signal(0);
  readonly panneauOuvert = signal(false);
  private intervalId?: ReturnType<typeof setInterval>;

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
    this.user()?.role === 'recruiter' ? 'Recruteur' : this.user()?.role === 'admin' ? 'Administrateur' : 'Candidat',
  );

  irVersMessages(): void {
    this.router.navigate(['/messages']);
  }

  toggleNotifications(): void {
    this.panneauOuvert.update((ouvert) => !ouvert);
    if (this.panneauOuvert()) {
      this.chargerNotifications();
    }
  }

  ouvrirNotification(notification: AppNotification): void {
    this.panneauOuvert.set(false);
    if (!notification.read_at) {
      this.notificationService.marquerLu(notification.id).subscribe({
        next: () => this.chargerNonLues(),
        error: () => {},
      });
    }
    this.router.navigateByUrl(notification.data.url);
  }

  toutMarquerLu(): void {
    this.notificationService.marquerToutLu().subscribe({
      next: () => {
        this.chargerNotifications();
        this.notificationsNonLues.set(0);
      },
      error: () => {},
    });
  }

  ngOnInit(): void {
    this.messageService.nonLus().subscribe({
      next: (res) => this.nonLus.set(res.non_lus),
      error: () => {
        /* pas bloquant pour l'affichage de l'en-tête */
      },
    });

    this.chargerNonLues();
    this.intervalId = setInterval(() => this.chargerNonLues(), INTERVALLE_POLLING_MS);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private chargerNonLues(): void {
    this.notificationService.nonLues().subscribe({
      next: (res) => this.notificationsNonLues.set(res.non_lues),
      error: () => {},
    });
  }

  private chargerNotifications(): void {
    this.notificationService.list().subscribe({
      next: (res) => this.notifications.set(res.data),
      error: () => {},
    });
  }
}
