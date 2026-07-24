import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth';
import { ConversationSummary, Message } from '../../../models/message.model';
import { extractErrorMessage } from '../../../services/api';

const MESSAGE_TEMPLATES = [
  {
    label: 'Félicitations',
    texte:
      'Félicitations ! Votre profil a retenu toute notre attention et nous souhaitons poursuivre les échanges avec vous.',
  },
  {
    label: 'Candidature retenue',
    texte:
      'Nous avons le plaisir de vous informer que votre candidature a été retenue pour la suite du processus de recrutement.',
  },
  {
    label: 'Candidature non retenue',
    texte:
      "Nous vous remercions pour l'intérêt porté à notre entreprise. Après étude attentive de votre candidature, nous sommes au regret de vous informer que nous ne donnerons pas suite à celle-ci.",
  },
];

@Component({
  selector: 'app-messages',
  imports: [FormsModule, DatePipe],
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
})
export class Messages implements OnInit {
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private auth = inject(AuthService);

  readonly templates = MESSAGE_TEMPLATES;
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly isRecruiter = computed(() => this.auth.role() === 'recruiter');

  readonly conversations = signal<ConversationSummary[]>([]);
  readonly loadingConversations = signal(true);

  readonly selectedUserId = signal<number | null>(null);
  readonly selectedUserName = signal<string | null>(null);
  readonly selectedApplicationId = signal<number | null>(null);
  readonly messages = signal<Message[]>([]);
  readonly loadingThread = signal(false);

  readonly sending = signal(false);
  readonly errorMessage = signal<string | null>(null);
  contenu = '';

  readonly peutRepondre = computed(
    () => this.isRecruiter() || this.messages().some((m) => m.expediteur_id === this.selectedUserId()),
  );

  ngOnInit(): void {
    this.chargerConversations();

    const withId = Number(this.route.snapshot.queryParamMap.get('with'));
    if (withId) {
      const applicationId = Number(this.route.snapshot.queryParamMap.get('application')) || null;
      const withName = this.route.snapshot.queryParamMap.get('withName');
      this.selectionner(withId, applicationId, withName ?? undefined);
    }
  }

  chargerConversations(): void {
    this.loadingConversations.set(true);
    this.messageService.conversations().subscribe({
      next: (res) => {
        this.conversations.set(res);
        this.loadingConversations.set(false);
      },
      error: () => this.loadingConversations.set(false),
    });
  }

  selectionner(userId: number, applicationId: number | null = null, fallbackName?: string): void {
    this.selectedUserId.set(userId);
    this.selectedApplicationId.set(applicationId);
    this.errorMessage.set(null);

    const existant = this.conversations().find((c) => c.utilisateur.id === userId);
    this.selectedUserName.set(existant?.utilisateur.name ?? fallbackName ?? 'Utilisateur');

    this.loadingThread.set(true);
    this.messageService.conversation(userId).subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.loadingThread.set(false);
        this.conversations.update((list) =>
          list.map((c) => (c.utilisateur.id === userId ? { ...c, non_lus: 0 } : c)),
        );
      },
      error: () => this.loadingThread.set(false),
    });
  }

  appliquerTemplate(texte: string): void {
    this.contenu = texte;
  }

  envoyer(): void {
    const userId = this.selectedUserId();
    if (!userId || !this.contenu.trim()) return;

    this.sending.set(true);
    this.errorMessage.set(null);

    this.messageService.send(userId, this.contenu.trim(), this.selectedApplicationId() ?? undefined).subscribe({
      next: (res) => {
        this.messages.update((list) => [...list, res.data]);
        this.contenu = '';
        this.sending.set(false);
        this.chargerConversations();
      },
      error: (err) => {
        this.sending.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
