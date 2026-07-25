import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LayoutUiService } from '../../services/layout-ui.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_RECRUTEUR: NavItem[] = [
  { label: 'Tableau de bord', path: '/recruiter/dashboard', icon: 'home' },
  { label: "Offres d'emploi", path: '/recruiter/jobs', icon: 'briefcase' },
  { label: 'Candidats', path: '/recruiter/candidates', icon: 'users' },
  { label: 'Entretiens', path: '/recruiter/interviews', icon: 'calendar' },
  { label: 'Messages', path: '/messages', icon: 'message' },
  { label: 'Analyses', path: '/recruiter/analytics', icon: 'chart' },
  { label: 'Paramètres', path: '/recruiter/settings', icon: 'settings' },
];

const NAV_CANDIDAT: NavItem[] = [
  { label: 'Tableau de bord', path: '/candidate/dashboard', icon: 'home' },
  { label: 'Trouver des offres', path: '/candidate/jobs', icon: 'briefcase' },
  { label: 'Mes candidatures', path: '/candidate/applications', icon: 'file' },
  { label: 'Messages', path: '/messages', icon: 'message' },
  { label: 'Profil', path: '/candidate/profile', icon: 'user' },
];

const NAV_ADMIN: NavItem[] = [
  { label: 'Tableau de bord', path: '/admin/dashboard', icon: 'home' },
  { label: 'Entreprises', path: '/admin/companies', icon: 'briefcase' },
  { label: 'Recruteurs', path: '/admin/recruiters', icon: 'users' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly layoutUi = inject(LayoutUiService);

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.auth.role();
    if (role === 'admin') return NAV_ADMIN;
    if (role === 'recruiter') return NAV_RECRUTEUR;
    return NAV_CANDIDAT;
  });

  seDeconnecter(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
