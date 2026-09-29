import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../core/services/auth';

interface Measurement {
  id: number;
  systolicPressure: number;
  diastolicPressure: number;
  bloodGlucose: number | null;
  cholesterol: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  measurementDate: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private apiUrl = 'http://localhost:8082/api/patients';

  profile: any = null;
  profileError = '';

  measurements: Measurement[] = [];
  measurementsError = '';

  // Champs du formulaire d'ajout
  systolicPressure: number | null = null;
  diastolicPressure: number | null = null;
  bloodGlucose: number | null = null;
  cholesterol: number | null = null;
  weight: number | null = null;
  height: number | null = null;

  formError = '';
  formSuccess = '';
  isSaving = false;

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

    // 1) On charge le profil (qui contient l'id du patient), 2) puis ses mesures
    this.http.get<any>(`${this.apiUrl}/me`).subscribe({
      next: (data) => {
        this.profile = data;
        this.cdr.detectChanges();
        this.loadMeasurements();
      },
      error: (err) => {
        this.profileError = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });
  }

  loadMeasurements(): void {
    this.http.get<Measurement[]>(`${this.apiUrl}/${this.profile.id}/measurements`).subscribe({
      next: (data) => {
        // Les mesures les plus récentes en premier
        this.measurements = [...data].sort((a, b) =>
          new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
        );
        this.measurementsError = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.measurementsError = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });
  }

  addMeasurement(): void {
    this.formError = '';
    this.formSuccess = '';

    if (this.systolicPressure == null || this.diastolicPressure == null) {
      this.formError = 'La pression systolique et la pression diastolique sont obligatoires';
      return;
    }
    if (!this.profile) {
      return;
    }

    this.isSaving = true;

    this.http.post(`${this.apiUrl}/${this.profile.id}/measurements`, {
      systolicPressure: this.systolicPressure,
      diastolicPressure: this.diastolicPressure,
      bloodGlucose: this.bloodGlucose,
      cholesterol: this.cholesterol,
      weight: this.weight,
      height: this.height
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.formSuccess = 'Mesure enregistrée ✅';
        this.systolicPressure = null;
        this.diastolicPressure = null;
        this.bloodGlucose = null;
        this.cholesterol = null;
        this.weight = null;
        this.height = null;
        this.cdr.detectChanges();
        this.loadMeasurements();
      },
      error: (err) => {
        this.isSaving = false;
        this.formError = 'Erreur ' + err.status + ' : ' + (err.error?.message ?? err.statusText ?? 'inconnue');
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}