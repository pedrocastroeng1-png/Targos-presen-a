import fs from 'fs';
let content = fs.readFileSync('src/services/supabase/auth.ts', 'utf8');

const oldRole = `  async getUserRole(user: User | null): Promise<'ADMIN' | 'OPERATOR'> {
    if (!user || !user.email) return 'OPERATOR';
    
    // Provisório: Baseado na regra de que PEDRO é admin.
    // Futuramente aqui consultará a tabela "profiles" / "usuarios".
    if (user.email === 'pedro@targos.local') {
      return 'ADMIN';
    }
    
    return 'OPERATOR';
  }`;

const newRole = `  async getUserRole(user: User | null): Promise<'ADMIN' | 'OPERATOR'> {
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
  }`;

content = content.replace(oldRole, newRole);
fs.writeFileSync('src/services/supabase/auth.ts', content);
