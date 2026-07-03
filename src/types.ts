export type UserRole = 'ADMIN' | 'OPERATOR';

export interface Profile {
  id: string; // auth.users id
  username: string;
  role: UserRole;
  name: string;
  status: 'ATIVO' | 'INATIVO';
  created_at?: string;
}

export interface Obra {
  id: string;
  nome: string;
  endereco?: string;
  status: 'ATIVA' | 'INATIVA';
  created_at?: string;
}

export interface Funcionario {
  id: string;
  obra_id: string;
  nome: string;
  funcao: string;
  valor_diaria: number;
  status: 'ATIVO' | 'INATIVO' | 'DESLIGADO';
  data_desligamento?: string;
  usuario_desligamento_id?: string;
  created_at?: string;
}

export interface Presenca {
  id: string;
  funcionario_id: string;
  obra_id: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm:ss
  usuario_id: string;
  status: 'PRESENTE' | 'FALTOU';
  valor_pago: number;
  observacao?: string;
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
