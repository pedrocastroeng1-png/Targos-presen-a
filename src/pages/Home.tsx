import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HardHat, CheckCircle2, Hourglass, Camera, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [dayMessage, setDayMessage] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [obrasStatus, setObrasStatus] = useState<any[]>([]);

  useEffect(() => {
    // Update date occasionally
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    fetchObrasStatus();
    return () => clearInterval(interval);
  }, []);

  const fetchObrasStatus = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase.from('projects').select('*').eq('active', true).order('name');
    if (data) {
      const status = data.map(obra => {
        const manhaConcluido = localStorage.getItem(`turno_${obra.id}_${today}_MANHA`) === 'true';
        const tardeConcluido = localStorage.getItem(`turno_${obra.id}_${today}_TARDE`) === 'true';
        return {
          ...obra,
          manha: manhaConcluido,
          tarde: tardeConcluido
        };
      });
      setObrasStatus(status);
    }
  };

  useEffect(() => {
    const hour = currentDate.getHours();
    if (hour >= 5 && hour < 12) setGreeting('Bom dia');
    else if (hour >= 12 && hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const dayOfWeek = currentDate.getDay();
    const days = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    
    // Custom messages
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setDayMessage(`Ótimo ${days[dayOfWeek]}!`);
    } else {
      setDayMessage(`Ótima ${days[dayOfWeek]}!`);
    }
  }, [currentDate]);

  const userName = user?.email?.split('@')[0].toUpperCase() || 'Equipe';

  return (
    <div className="h-full flex flex-col justify-center max-w-2xl mx-auto space-y-12 py-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center bg-blue-100 text-blue-900 p-4 rounded-full mb-4">
          <HardHat size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-2xl text-blue-900 font-medium">
            {dayMessage}
          </p>
        </div>

        <p className="text-lg text-gray-500 max-w-md mx-auto pt-4">
          Vamos registrar a presença dos nossos colaboradores hoje?
        </p>
      </div>

      <div className="pt-8">
        <Button 
          onClick={() => navigate('/obras')}
          className="w-full h-24 text-2xl rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-blue-950 hover:bg-blue-900 text-white"
        >
          REGISTRAR PRESENÇA
        </Button>
      </div>

      {/* Dashboard Section */}
      <div className="pt-12 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Status de Hoje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {obrasStatus.map(obra => (
            <div key={obra.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
              <div className="flex items-center space-x-3 border-b pb-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-900">
                  <HardHat size={20} />
                </div>
                <h3 className="font-bold text-gray-900">{obra.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">MANHÃ</span>
                  {obra.manha ? (
                    <div className="flex flex-col space-y-1 mt-1">
                      <span className="flex items-center text-green-600 font-medium text-sm">
                        <CheckCircle2 size={16} className="mr-1" /> Registrada
                      </span>
                      <span className="flex items-center text-gray-500 font-medium text-xs">
                        <Camera size={12} className="mr-1" /> 18 Fotos (mock)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1 mt-1">
                      <span className="flex items-center text-orange-500 font-medium text-sm">
                        <Hourglass size={16} className="mr-1" /> Pendente
                      </span>
                      <span className="flex items-center text-orange-400 font-medium text-xs">
                        <AlertTriangle size={12} className="mr-1" /> Sem fotos
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">TARDE</span>
                  {obra.tarde ? (
                    <span className="flex items-center text-green-600 font-medium text-sm">
                      <CheckCircle2 size={16} className="mr-1" /> Concluído
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-500 font-medium text-sm">
                      <Hourglass size={16} className="mr-1" /> Pendente
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
