import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../core/services/auth';
import { RiskAssessmentService } from '../../core/services/risk-assessment';
import { RiskAssessment, RiskFactor } from '../../core/models/risk.model';

interface PatientItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string | null;
  gender: string | null;
}

const FEATURE_LABELS: Record<string, string> = {
  age_years: 'Âge',
  gender: 'Genre',
  height: 'Taille',
  weight: 'Poids',
  bmi: 'IMC',
  ap_hi: 'Tension systolique',
  ap_lo: 'Tension diastolique',
  pulse_pressure: 'Pression pulsée',
  cholesterol: 'Cholestérol',
  gluc: 'Glycémie',
  smoke: 'Tabac',
  alco: 'Alcool',
  active: 'Activité physique'
};

const LEVEL_LABELS: Record<string, string> = {
  LOW: 'Risque faible',
  MODERATE: 'Risque modéré',
  HIGH: 'Risque élevé'
};

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

  // --- Prédiction ---
  selectedPatient: PatientItem | null = null;
  result: RiskAssessment | null = null;
  predictingId: number | null = null;
  predictError = '';

  constructor(
    private authService: Auth,
    private router: Router,
    private http: HttpClient,
    private riskService: RiskAssessmentService,
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

  // Lance la prédiction pour un patient
  predict(patient: PatientItem): void {
    this.selectedPatient = patient;
    this.result = null;
    this.predictError = '';
    this.predictingId = patient.id;

    this.riskService.predict(patient.id).subscribe({
      next: (r) => {
        this.result = r;
        this.predictingId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.predictError = 'Erreur ' + err.status + ' : impossible de calculer le risque. '
          + 'Vérifiez que le patient a des mesures (taille, poids, tension) et que le service IA est démarré.';
        this.predictingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  closeResult(): void {
    this.selectedPatient = null;
    this.result = null;
    this.predictError = '';
  }

  // --- Aides d'affichage ---
  get riskPercent(): number {
    return Math.round((this.result?.riskScore ?? 0) * 100);
  }

  get levelLabel(): string {
    return LEVEL_LABELS[this.result?.riskLevel ?? ''] ?? 'Niveau inconnu';
  }

  featureLabel(feature: string): string {
    return FEATURE_LABELS[feature] ?? feature;
  }

  // Largeur de la barre (en %) proportionnelle à l'impact le plus fort
  barWidth(factor: RiskFactor): number {
    const factors = this.result?.topFactors ?? [];
    const max = Math.max(...factors.map(f => Math.abs(f.impact)), 0.0001);
    return Math.round((Math.abs(factor.impact) / max) * 100);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}