import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Search, MapPin, Clock, Calendar, User, Camera, Building2, UserCircle2 } from 'lucide-react';
import { storageService } from '@/services/supabase/storage';
import { useEffect } from 'react';
import { AuditoriaFoto } from '@/types';

// Dados mockados temporariamente para visualização da galeria
const mockFotos: AuditoriaFoto[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `mock-${i}`,
  url: 'https://images.unsplash.com/photo-1541888086925-92058a5a452d?auto=format&fit=crop&w=500&q=60',
  funcionario_nome: `Funcionário Exemplo ${i + 1}`,
  obra_nome: 'Casa Clube',
  operador_nome: 'Pedro Admin',
  data: format(new Date(), 'dd/MM/yyyy'),
  hora: `07:${10 + i}`,
  turno: 'MANHA',
}));

export default function AdminAuditoria() {
  const [fotos, setFotos] = useState<AuditoriaFoto[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<AuditoriaFoto | null>(null);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFoto) {
      if (selectedFoto.url && !selectedFoto.url.startsWith('http')) {
        storageService.getSignedUrl(selectedFoto.url).then(setSignedPhotoUrl).catch(() => setSignedPhotoUrl(null));
      } else {
        setSignedPhotoUrl(selectedFoto.url);
      }
    } else {
      setSignedPhotoUrl(null);
    }
  }, [selectedFoto]);

  const [filtros, setFiltros] = useState({
    dataInicial: format(new Date(), 'yyyy-MM-dd'),
    dataFinal: format(new Date(), 'yyyy-MM-dd'),
    obra: '',
    funcionario: '',
    operador: '',
  });

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula a busca no banco de dados
    setFotos(mockFotos);
    setHasSearched(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
            <Camera className="mr-3 text-blue-900" size={32} />
            Auditoria de Presença
          </h1>
          <p className="text-gray-500 mt-1">Verifique as comprovações fotográficas de presença (Turno Manhã)</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input 
                type="date" 
                value={filtros.dataInicial}
                onChange={e => setFiltros({...filtros, dataInicial: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input 
                type="date" 
                value={filtros.dataFinal}
                onChange={e => setFiltros({...filtros, dataFinal: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Obra (Opcional)</Label>
              <Input 
                placeholder="Nome da obra"
                value={filtros.obra}
                onChange={e => setFiltros({...filtros, obra: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Funcionário (Opcional)</Label>
              <Input 
                placeholder="Nome do funcionário"
                value={filtros.funcionario}
                onChange={e => setFiltros({...filtros, funcionario: e.target.value})}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 h-10">
              <Search className="mr-2 h-4 w-4" /> FILTRAR
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500 font-medium px-1">
            <span>{fotos.length} fotos encontradas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {fotos.map(foto => (
              <div 
                key={foto.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => setSelectedFoto(foto)}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={foto.url} 
                    alt={foto.funcionario_nome} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white font-medium truncate text-sm">{foto.funcionario_nome}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-xs text-gray-600">
                  <p className="flex items-center"><Building2 size={14} className="mr-2 text-gray-400" /> {foto.obra_nome}</p>
                  <p className="flex items-center"><Calendar size={14} className="mr-2 text-gray-400" /> {foto.data} às {foto.hora}</p>
                  <p className="flex items-center"><UserCircle2 size={14} className="mr-2 text-gray-400" /> Op: {foto.operador_nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={!!selectedFoto} onOpenChange={(open) => !open && setSelectedFoto(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black border-0">
          <DialogTitle className="sr-only">Visualização de Foto</DialogTitle>
          <DialogDescription className="sr-only">Visualização ampliada da foto de comprovação de presença</DialogDescription>
          {selectedFoto && (
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              <div className="flex-1 bg-black flex items-center justify-center p-4">
                <img 
                  src={signedPhotoUrl || ''} 
                  alt={selectedFoto.funcionario_nome} 
                  className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain"
                />
              </div>
              <div className="w-full md:w-80 bg-white p-6 space-y-6 md:overflow-y-auto">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Detalhes do Registro</h3>
                  <div className="h-1 w-12 bg-blue-600 rounded"></div>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Funcionário</p>
                    <p className="font-medium text-gray-900">{selectedFoto.funcionario_nome}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Obra</p>
                    <p className="font-medium text-gray-900">{selectedFoto.obra_nome}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Turno</p>
                    <p className="font-medium text-gray-900">{selectedFoto.turno === 'MANHA' ? 'MANHÃ' : 'TARDE'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Data</p>
                      <p className="font-medium text-gray-900">{selectedFoto.data}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Hora</p>
                      <p className="font-medium text-gray-900">{selectedFoto.hora}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Operador Responsável</p>
                    <p className="font-medium text-gray-900">{selectedFoto.operador_nome}</p>
                  </div>
                  
                  {/* Coordenadas Mockadas para demonstração da estrutura */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold mb-1 flex items-center">
                      <MapPin size={12} className="mr-1" /> GPS (Coordenadas)
                    </p>
                    <p className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded border">-23.550520, -46.633308</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full" onClick={() => setSelectedFoto(null)}>
                    FECHAR
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
