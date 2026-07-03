import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [dayMessage, setDayMessage] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Update date occasionally
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="h-full flex flex-col justify-center max-w-2xl mx-auto space-y-12 py-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center bg-blue-100 text-blue-900 p-4 rounded-full mb-4">
          <HardHat size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {greeting}, {profile?.name?.split(' ')[0] || 'Equipe'}
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
    </div>
  );
}
