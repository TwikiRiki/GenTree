
export type Language = 'en' | 'it';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface HealthProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  bloodType?: string;
  notes?: string;
  ownerId: string;
  sharedWith: string[];
}

export interface VitalRecord {
  id: string;
  patientId: string;
  timestamp: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  oxygenSaturation: number;
  notes?: string;
}
