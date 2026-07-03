import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Moon, Eye, Edit, Ban } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Obra } from '@/types';

export default function TurnoSelection() {
  const { id: obraId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [obra, setObra] = useState<Obra | null>(null);
  
  const [selectedTurno, setSelectedTurno] = useState<'MANHA' | 'TARDE' | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (obraId) {
      supabase.from('obras').select('*').eq('id', obraId).single().then(({ data }) => setObra(data));
    }
  }, [obraId]);

  const handleTurnoClick = (turno: 'MANHA' | 'TARDE') => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const registered = localStorage.getItem(`turno_${obraId}_${today}_${turno}`) === 'true';
    
    setSelectedTurno(turno);
    setIsRegistered(registered);

    if (!registered) {
      navigate(`/obras/${obraId}/presenca?turno=${turno}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{obra?.nome}</h1>
        <p className="text-gray-500 mt-2">Qual turno deseja registrar?</p>
      </div>

      {!selectedTurno || !isRegistered ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:border-orange-500 hover:shadow-lg transition-all group overflow-hidden"
            onClick={() => handleTurnoClick('MANHA')}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <Sun className="w-20 h-20 text-orange-400 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-gray-900">MANHÃ</h2>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group overflow-hidden"
            onClick={() => handleTurnoClick('TARDE')}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <Moon className="w-20 h-20 text-blue-900 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-gray-900">TARDE</h2>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-yellow-50 text-yellow-600 p-6 rounded-full inline-flex mb-4">
              {selectedTurno === 'MANHA' ? <Sun size={64} /> : <Moon size={64} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Já existe um registro para esta obra no turno da {selectedTurno === 'MANHA' ? 'manhã' : 'tarde'}.
            </h2>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button variant="outline" className="h-14 px-8 text-lg" onClick={() => alert('Visualização será implementada futuramente')}>
                <Eye className="mr-2" /> Visualizar
              </Button>
              
              {profile?.role === 'ADMIN' && (
                <Button variant="outline" className="h-14 px-8 text-lg" onClick={() => navigate(`/obras/${obraId}/presenca?turno=${selectedTurno}`)}>
                  <Edit className="mr-2" /> Editar
                </Button>
              )}

              <Button disabled className="h-14 px-8 text-lg">
                <Ban className="mr-2" /> Novo Registro
              </Button>
            </div>

            <div className="pt-8">
              <Button variant="ghost" onClick={() => setSelectedTurno(null)}>Voltar para seleção de turno</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
