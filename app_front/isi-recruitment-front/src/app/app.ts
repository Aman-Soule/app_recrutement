import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api';  // <-- Importer ApiService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="text-align:center; margin-top: 50px; font-family: Arial, sans-serif;">
      <h1>🚀 Test de connexion Backend</h1>
      <p style="font-size: 1.4rem;">
        Statut : <strong>{{ message }}</strong>
      </p>
    </div>
  `,
  styles: []
})
export class App implements OnInit {
  message = '⏳ En attente de la réponse du backend...';

  constructor(private api: ApiService) {}  // <-- Type ApiService

  ngOnInit() {
    console.log('✅ App initialisée');
    this.api.ping().subscribe({
      next: (response: any) => {   // <-- type explicite
        console.log('✅ Réponse reçue :', response);
        this.message = '✅ ' + response.message;
      },
      error: (error: any) => {     // <-- type explicite
        console.error('❌ Erreur :', error);
        this.message = '❌ Erreur de connexion. Vérifie la console.';
      }
    });
  }
}