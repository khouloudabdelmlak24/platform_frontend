import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientRiskSummary, RiskAssessment } from '../models/risk.model';

@Injectable({
  providedIn: 'root'
})
export class RiskAssessmentService {
  private apiUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  // Lance une prediction pour un patient (reserve au medecin)
  predict(patientId: number): Observable<RiskAssessment> {
    return this.http.post<RiskAssessment>(`${this.apiUrl}/doctor/patients/${patientId}/predict`, {});
  }

  // Historique des evaluations d'un patient
  getHistory(patientId: number): Observable<RiskAssessment[]> {
    return this.http.get<RiskAssessment[]>(`${this.apiUrl}/patients/${patientId}/risk-assessments`);
  }

  // Derniere evaluation de chaque patient (dashboard medecin)
  getLatestForAll(): Observable<PatientRiskSummary[]> {
    return this.http.get<PatientRiskSummary[]>(`${this.apiUrl}/doctor/risk-assessments/latest`);
  }
}
