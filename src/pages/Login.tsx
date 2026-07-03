import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Append @targos.local behind the scenes to use Supabase Auth
      const email = `${username.toLowerCase().trim()}@targos.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Usuário ou senha incorretos');
      } else if (data.user) {
        // Fetch role to redirect properly
        const { data: profile } = await supabase
          .from('usuarios')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError('Ocorreu um erro no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-blue-900 p-4 rounded-2xl text-white shadow-lg">
            <HardHat size={48} />
          </div>
          <h1 className="text-3xl font-bold text-blue-950 tracking-tight">TARGOS PRESENÇA</h1>
        </div>

        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-0 pt-8 px-8">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Acesse o sistema com suas credenciais.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100 font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-14 bg-gray-50 border-gray-200"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 bg-gray-50 border-gray-200"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold rounded-xl"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'ENTRAR'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
