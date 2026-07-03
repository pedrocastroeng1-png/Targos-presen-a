import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Obra } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminObras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [status, setStatus] = useState<'ATIVA' | 'INATIVA'>('ATIVA');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('obras').select('*').order('nome');
      setObras(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (o?: Obra) => {
    if (o) {
      setEditingId(o.id);
      setNome(o.nome);
      setEndereco(o.endereco || '');
      setStatus(o.status);
    } else {
      setEditingId(null);
      setNome('');
      setEndereco('');
      setStatus('ATIVA');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { nome, endereco, status };
      if (editingId) {
        await supabase.from('obras').update(payload).eq('id', editingId);
      } else {
        await supabase.from('obras').insert([payload]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir esta obra? (Verifique se não há funcionários vinculados)')) {
      await supabase.from('obras').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Obras</h1>
          <p className="text-gray-500">Gerencie as obras e canteiros.</p>
        </div>
        <Button onClick={() => openModal()} className="h-12"><Plus className="mr-2"/> Nova Obra</Button>
      </div>

      <div className="grid gap-4">
        {obras.map(o => (
          <Card key={o.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-bold text-lg">{o.nome}</h3>
                <p className="text-sm text-gray-500">{o.endereco} &bull; <span className={o.status === 'ATIVA' ? 'text-green-600' : 'text-red-600'}>{o.status}</span></p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => openModal(o)}><Edit2 size={16}/></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(o.id)}><Trash2 size={16}/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Obra' : 'Nova Obra'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Obra</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={endereco} onChange={e => setEndereco(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
                value={status} onChange={e => setStatus(e.target.value as 'ATIVA' | 'INATIVA')} required
              >
                <option value="ATIVA">Ativa</option>
                <option value="INATIVA">Inativa</option>
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
