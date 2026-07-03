import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export const authService = {
  /**
   * Converte o nome de usuário (ex: PEDRO) para o formato de email interno (ex: pedro@targos.local)
   */
  formatInternalEmail(username: string): string {
    return `${username.toLowerCase().trim()}@targos.local`;
  },

  async signIn(username: string, password: string) {
    const email = this.formatInternalEmail(username);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  },

  /**
   * Simula a busca do role do usuário baseando-se no e-mail provisoriamente,
   * preparando a estrutura para futuramente buscar da tabela de profiles/usuarios.
   */
  async getUserRole(user: User | null): Promise<'ADMIN' | 'OPERATOR'> {
    if (!user || !user.email) return 'OPERATOR';
    
    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('auth_user_id', user.id).single();
      if (!error && data) {
        return data.role;
      }
    } catch (e) {
      console.error(e);
    }
    return 'OPERATOR';
  }
};
