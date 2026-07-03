import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, ShieldAlert, UserPlus, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewUserMode, setIsNewUserMode] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('OPERATOR');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('usuarios').select('*').order('name');
      setUsuarios(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openNewUserModal = () => {
    setIsNewUserMode(true);
    setEditingUser(null);
    setNome('');
    setUsername('');
    setSenha('');
    setRole('OPERATOR');
    setStatus('ATIVO');
    setIsModalOpen(true);
  };

  const openEditModal = (u: Profile) => {
    setIsNewUserMode(false);
    setEditingUser(u);
    setNome(u.name);
    setUsername(u.username);
    setRole(u.role);
    setStatus(u.status);
    setSenha(''); // Keep empty, don't show existing
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isNewUserMode) {
        // Use a secondary client so it doesn't log the current admin out when signing up
        const tempSupabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const email = `${username.toLowerCase().trim()}@targos.local`;

        // 1. Create auth user
        const { data: authData, error: authError } = await tempSupabase.auth.signUp({
          email,
          password: senha,
        });

        if (authError) throw authError;

        // 2. Wait a moment for trigger to run, then update name, role, status
        if (authData.user) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { error: updateError } = await supabase
            .from('usuarios')
            .update({
              name: nome,
              role: role,
              status: status
            })
            .eq('id', authData.user.id);

          if (updateError) throw updateError;
        }
      } else {
        // Edit mode
        if (!editingUser) return;
        const { error } = await supabase
          .from('usuarios')
          .update({ name: nome, role: role, status: status })
          .eq('id', editingUser.id);
          
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert('Erro ao salvar usuário: ' + (error.message || 'Verifique se o usuário já existe.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: Profile) => {
    try {
      const newStatus = user.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
      const { error } = await supabase
        .from('usuarios')
        .update({ status: newStatus })
        .eq('id', user.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Erro ao alterar status do usuário');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando usuários...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Usuários do Sistema</h1>
          <p className="text-gray-500">Gerencie operadores e administradores.</p>
        </div>
        <Button onClick={openNewUserModal} className="gap-2">
          <UserPlus size={20} />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.map(u => (
          <Card key={u.id} className={u.status === 'INATIVO' ? 'opacity-75 bg-gray-50' : ''}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {u.role === 'ADMIN' ? <ShieldAlert size={24} /> : <Shield size={24} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{u.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">@{u.username}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditModal(u)}>
                  <Edit2 size={16}/>
                </Button>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Permissão</span>
                  <span className="font-medium text-gray-900">
                    {u.role === 'ADMIN' ? 'Administrador' : 'Operador'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${u.status === 'ATIVO' ? 'text-green-600' : 'text-red-600'}`}>
                    {u.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button 
                  variant={u.status === 'ATIVO' ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => toggleUserStatus(u)}
                  className="w-full text-xs font-medium"
                >
                  {u.status === 'ATIVO' ? 'Desativar Acesso' : 'Reativar Acesso'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewUserMode ? 'Novo Usuário' : 'Editar Usuário'}</DialogTitle>
            <DialogDescription>
              {isNewUserMode 
                ? 'Crie um novo usuário para acessar o sistema. O login será feito através do nome de usuário.'
                : 'Altere os dados do perfil do usuário.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                required 
                placeholder="Nome Completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Usuário (Login)</Label>
              <Input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="Ex: JOAO"
                autoCapitalize="none"
                disabled={!isNewUserMode} // Não permite alterar username depois de criado
              />
              {!isNewUserMode && <p className="text-xs text-gray-500">O nome de usuário não pode ser alterado.</p>}
            </div>
            
            {isNewUserMode && (
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input 
                  type="password"
                  value={senha} 
                  onChange={e => setSenha(e.target.value)} 
                  required={isNewUserMode}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <select 
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={role} 
                onChange={e => setRole(e.target.value as 'ADMIN' | 'OPERATOR')} 
                required
              >
                <option value="OPERATOR">Operador (Apenas registrar presença)</option>
                <option value="ADMIN">Administrador (Acesso total)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={status} 
                onChange={e => setStatus(e.target.value as 'ATIVO' | 'INATIVO')} 
                required
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
