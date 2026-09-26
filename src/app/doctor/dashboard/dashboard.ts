import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  patients: any[] = [];
  apiStatus: string = 'Chargement...';

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

    this.http.get<any[]>('http://localhost:8082/api/patients').subscribe({
      next: (data) => {
        this.patients = data;
        this.apiStatus = 'Succès : ' + data.length + ' patient(s) reçu(s)';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.apiStatus = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}