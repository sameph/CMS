export type UserRole = 'receptionist' | 'opd' | 'laboratory' | 'injection';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: string;
  bloodType?: string;
  allergies?: string[];
  registrationDate: string;
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  result?: string;
  resultDate?: string;
  fee: number;
  isPaid: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  status: 'pending' | 'dispensed' | 'partially-dispensed';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  type: 'consultation' | 'laboratory' | 'medication' | 'injection';
  amount: number;
  method: 'cash' | 'card';
  status: 'pending' | 'completed';
  date: string;
  reference?: string;
}

export interface DrugStoreItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate: string;
  reorderLevel: number;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingLabTests: number;
  pendingPrescriptions: number;
  todayRevenue: number;
  lowStockItems: number;
}

// Lab Request types (client-side view over backend model)
export type LabRequestStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface LabRequestCategoryItems {
  category: 'Hematology' | 'Urinalysis' | 'Chemistry' | 'Serology';
  items: string[]; // human labels (e.g., 'WBC', 'FBS/RBS')
}

export interface LabRequestListItem {
  id: string; // backend _id
  patientId?: string;
  patientName: string;
  requestedBy?: string;
  requestDate: string; // createdAt
  priority?: 'normal' | 'urgent';
  clinicalNotes?: string;
  status: LabRequestStatus;
  tests: LabRequestCategoryItems[];
}

