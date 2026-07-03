export type UserRole = 'ADMIN' | 'OPERATOR';

export interface Company {
  id: string;
  name: string;
  trade_name?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  logo?: string;
  active: boolean;
  created_at?: string;
}

export interface Profile {
  id: string; // auth.users id
  auth_user_id?: string;
  company_id?: string;
  username: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  company_id?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  start_date?: string;
  end_date?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Position {
  id: string;
  company_id?: string;
  name: string;
  daily_rate: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  company_id?: string;
  project_id: string;
  position_id: string;
  full_name: string;
  active: boolean;
  admission_date?: string;
  dismissal_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  name: string;
  factor: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AbsenceReason {
  id: string;
  description: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceSession {
  id: string;
  company_id?: string;
  project_id: string;
  shift_id: string;
  operator_id: string;
  attendance_date: string; // YYYY-MM-DD
  expected_employees: number;
  registered_employees: number;
  status: string;
  started_at: string;
  finished_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceItem {
  id: string;
  attendance_session_id: string;
  employee_id: string;
  status: 'PRESENTE' | 'FALTOU';
  absence_reason_id?: string;
  observation?: string;
  photo_path?: string;
  photo_taken_at?: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number;
  registered_by?: string;
  registered_at?: string;
  daily_factor?: number;
  synced?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DailyClosure {
  id: string;
  company_id?: string;
  employee_id: string;
  attendance_date: string;
  morning_factor?: number;
  afternoon_factor?: number;
  total_factor: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  description?: string;
  created_at?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AuditoriaFoto {
  id: string;
  url: string;
  funcionario_nome: string;
  obra_nome: string;
  operador_nome: string;
  data: string;
  hora: string;
  turno: 'MANHA' | 'TARDE';
}
