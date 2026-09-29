import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../core/services/auth';

interface AuditLog {
  id: number;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  user: { firstName: string; lastName: string; email: string } | null;
}

interface Stats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private apiUrl = 'http://localhost:8082/api/admin';

  stats: Stats | null = null;
  statsError = '';

  logs: AuditLog[] = [];
  logsError = '';

  constructor(
    private authService: Auth,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<Stats>(`${this.apiUrl}/stats`).subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.statsError = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });

    this.http.get<AuditLog[]>(`${this.apiUrl}/audit-logs?limit=50`).subscribe({
      next: (data) => {
        this.logs = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.logsError = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}