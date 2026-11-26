export interface RiskFactor {
  feature: string;
  impact: number;
  direction: string;
}

export interface RiskAssessment {
  id: number;
  riskScore: number | null;
  riskLevel: string | null;
  modelVersion: string | null;
  topFactors: RiskFactor[] | null;
  createdAt: string;
}

export interface PatientRiskSummary {
  patientId: number;
  riskScore: number | null;
  riskLevel: string | null;
  createdAt: string;
}
