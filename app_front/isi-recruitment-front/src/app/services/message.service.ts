import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Message {
  id: number;
  from: string;
  company: string;
  content: string;
  time: string;
  unread: boolean;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private messages: Message[] = [
    {
      id: 1,
      from: 'Sarah Jenkins',
      company: 'Google',
      content: 'Hi Alex, the team was impressed by your portfolio...',
      time: '15:30',
      unread: true
    },
    {
      id: 2,
      from: 'Mars Wilson',
      company: 'Stripe',
      content: 'Thanks for the assessment results. Let\'s talk...',
      time: '14:15',
      unread: false
    }
  ];

  getRecentMessages(): Observable<Message[]> {
    return of(this.messages);
  }
}