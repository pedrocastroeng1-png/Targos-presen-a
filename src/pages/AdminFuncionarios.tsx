import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee, Project, Position } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [obras, setObras] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
    const [obraId, setObraId] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: fData }, { data: oData }, { data: posData }] = await Promise.all([
        supabase.from('employees').select('*, position:positions(name)').order('full_name', { ascending: true }),
        supabase.from('projects').select('*').order('name'),
        supabase.from('positions').select('*').order('name')
      ]);
      setFuncionarios(fData || []);
      setObras(oData || []);
      setPositions(posData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (f?: Employee) => {
    if (f) {
      setEditingId(f.id);
      setNome(f.nome);
      setFuncao(f.funcao);
            setObraId(f.obra_id);
      setStatus(f.status);
    } else {
      setEditingId(null);
      setNome('');
      setFuncao('');
            setObraId(obras[0]?.id || '');
      setStatus('ATIVO');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nome,
        funcao,
        valor_diaria: 0,
        obra_id: obraId,
        status
      };

      if (editingId) {
        await supabase.from('employees').update(payload).eq('id', editingId);
      } else {
        await supabase.from('employees').insert([payload]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('employees').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Funcionários</h1>
          <p className="text-gray-500">Gerencie a equipe de todas as obras.</p>
        </div>
        <Button onClick={() => openModal()} className="h-12"><Plus className="mr-2"/> Novo Funcionário</Button>
      </div>

      <div className="grid gap-4">
        {funcionarios.map(f => {
          const obra = obras.find(o => o.id === f.project_id);
          const pos = positions.find(p => p.id === f.position_id);
          return (
            <Card key={f.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-bold text-lg">{f.full_name}</h3>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>{pos?.name || 'Cargo não encontrado'}</span>
                    <span>&bull;</span>
                    <span>{obra?.name || 'Obra não encontrada'}</span>
                    <span>&bull;</span>
                    <span className={f.active ? 'text-green-600' : 'text-red-600'}>{f.active ? 'ATIVO' : 'INATIVO'}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openModal(f)}><Edit2 size={16}/></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(f.id)}><Trash2 size={16}/></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <select className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm" value={funcao} onChange={e => setFuncao(e.target.value)} required>
                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Obra</Label>
              <select 
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={obraId} onChange={e => setObraId(e.target.value)} required
              >
                {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={active ? 'true' : 'false'} onChange={e => setActive(e.target.value === 'true')} required
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
