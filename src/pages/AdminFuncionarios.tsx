import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Funcionario, Obra } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [obraId, setObraId] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: fData }, { data: oData }] = await Promise.all([
        supabase.from('funcionarios').select('*').order('nome'),
        supabase.from('obras').select('*').order('nome')
      ]);
      setFuncionarios(fData || []);
      setObras(oData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (f?: Funcionario) => {
    if (f) {
      setEditingId(f.id);
      setNome(f.nome);
      setFuncao(f.funcao);
      setValorDiaria(f.valor_diaria.toString());
      setObraId(f.obra_id);
      setStatus(f.status);
    } else {
      setEditingId(null);
      setNome('');
      setFuncao('');
      setValorDiaria('');
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
        valor_diaria: Number(valorDiaria),
        obra_id: obraId,
        status
      };

      if (editingId) {
        await supabase.from('funcionarios').update(payload).eq('id', editingId);
      } else {
        await supabase.from('funcionarios').insert([payload]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('funcionarios').delete().eq('id', id);
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
          const obra = obras.find(o => o.id === f.obra_id);
          return (
            <Card key={f.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-bold text-lg">{f.nome}</h3>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>{f.funcao}</span>
                    <span>&bull;</span>
                    <span>{obra?.nome || 'Obra não encontrada'}</span>
                    <span>&bull;</span>
                    <span className={f.status === 'ATIVO' ? 'text-green-600' : 'text-red-600'}>{f.status}</span>
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
              <Label>Função</Label>
              <Input value={funcao} onChange={e => setFuncao(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Valor Diária (R$)</Label>
              <Input type="number" step="0.01" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Obra</Label>
              <select 
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={obraId} onChange={e => setObraId(e.target.value)} required
              >
                {obras.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={status} onChange={e => setStatus(e.target.value as 'ATIVO' | 'INATIVO')} required
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
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
