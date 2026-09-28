import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../core/services/auth';

interface PatientItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string | null;
  gender: string | null;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  patients: PatientItem[] = [];
  isLoading = true;
  errorMessage = '';

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

    this.http.get<PatientItem[]>('http://localhost:8082/api/patients').subscribe({
      next: (data) => {
        this.patients = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Statistique : nombre de patients dont le profil est renseigné (date de naissance présente)
  get completedProfiles(): number {
    return this.patients.filter(p => !!p.dateOfBirth).length;
  }

  // Calcule l'âge à partir de la date de naissance (null si non renseignée)
  getAge(dateOfBirth: string | null): number | null {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}