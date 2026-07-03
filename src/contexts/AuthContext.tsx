import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/supabase/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'ADMIN' | 'OPERATOR' | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  signOut: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sessão automaticamente quando o aplicativo abrir
    const initSession = async () => {
      try {
        const currentSession = await authService.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const userRole = await authService.getUserRole(currentSession.user);
          setRole(userRole);
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listener de mudança de estado da autenticação
    const subscription = authService.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        const userRole = await authService.getUserRole(newSession.user);
        setRole(userRole);
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

