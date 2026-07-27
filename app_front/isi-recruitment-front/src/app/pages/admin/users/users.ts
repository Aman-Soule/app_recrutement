import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../../services/admin-user.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { Role, User } from '../../../models/user.model';
import { extractErrorMessage } from '../../../services/api';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private userService = inject(AdminUserService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly utilisateurs = signal<User[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly errorMessage = signal<string | null>(null);
  recherche = '';
  role: Role | '' = '';

  ngOnInit(): void {
    this.charger();
  }

  charger(page = 1): void {
    this.loading.set(true);
    this.userService
      .list({ recherche: this.recherche || undefined, role: this.role || undefined, page })
      .subscribe({
        next: (res) => {
          this.utilisateurs.set(res.data);
          this.currentPage.set(res.current_page);
          this.lastPage.set(res.last_page);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  pageSuivante(): void {
    if (this.currentPage() < this.lastPage()) this.charger(this.currentPage() + 1);
  }

  pagePrecedente(): void {
    if (this.currentPage() > 1) this.charger(this.currentPage() - 1);
  }

  async toggleStatut(utilisateur: User): Promise<void> {
    const activer = !utilisateur.actif;
    const ok = await this.confirmDialog.confirm({
      title: activer ? 'Activer le compte' : 'Désactiver le compte',
      message: activer
        ? `Réactiver le compte de "${utilisateur.name}" ? Il pourra de nouveau se connecter.`
        : `Désactiver le compte de "${utilisateur.name}" ? Il ne pourra plus se connecter tant que le compte n'est pas réactivé.`,
      confirmLabel: activer ? 'Activer' : 'Désactiver',
      danger: !activer,
    });
    if (!ok) return;

    this.errorMessage.set(null);
    this.userService.changerStatut(utilisateur.id, activer).subscribe({
      next: (res) => {
        this.utilisateurs.update((list) =>
          list.map((u) => (u.id === utilisateur.id ? res.user : u)),
        );
      },
      error: (err) => this.errorMessage.set(extractErrorMessage(err)),
    });
  }

  async supprimer(utilisateur: User): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: "Supprimer l'utilisateur",
      message: `Supprimer définitivement le compte de "${utilisateur.name}" ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    this.errorMessage.set(null);
    this.userService.remove(utilisateur.id).subscribe({
      next: () => this.charger(this.currentPage()),
      error: (err) => this.errorMessage.set(extractErrorMessage(err)),
    });
  }
}
