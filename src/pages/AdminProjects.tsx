import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('projects').select('*').order('nome');
      setProjects(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (o?: Project) => {
    if (o) {
      setEditingId(o.id);
      setNome(o.name);
      setEndereco(o.address || '');
      setActive(o.active);
    } else {
      setEditingId(null);
      setNome('');
      setEndereco('');
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: nome, address: endereco, active };
      if (editingId) {
        await supabase.from('projects').update(payload).eq('id', editingId);
      } else {
        await supabase.from('projects').insert([payload]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir esta project? (Verifique se não há funcionários vinculados)')) {
      await supabase.from('projects').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projetos</h1>
          <p className="text-gray-500">Gerencie as projects e canteiros.</p>
        </div>
        <Button onClick={() => openModal()} className="h-12"><Plus className="mr-2"/> Nova Projeto</Button>
      </div>

      <div className="grid gap-4">
        {projects.map(o => (
          <Card key={o.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-bold text-lg">{o.name}</h3>
                <p className="text-sm text-gray-500">{o.address} &bull; <span className={o.active ? 'text-green-600' : 'text-red-600'}>{(o.active ? 'Ativa' : 'Inativa')}</span></p>
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
            <DialogTitle>{editingId ? 'Editar Projeto' : 'Nova Projeto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Projeto</Label>
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
                value={active ? 'true' : 'false'} onChange={e => setActive(e.target.value === 'true')} required
              >
                <option value="true">Ativa</option>
                <option value="false">Inativa</option>
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
