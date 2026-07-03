import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Obra } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ChevronRight, HardHat } from 'lucide-react';

export default function ObrasSelection() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('status', 'ATIVA')
        .order('nome');

      if (error) throw error;
      setObras(data || []);
    } catch (error) {
      console.error('Error fetching obras:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Selecione a Obra</h1>
        <p className="text-gray-500 mt-2">Escolha a obra para registrar as presenças de hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {obras.length === 0 ? (
          <Card className="col-span-full border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <HardHat className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">Nenhuma obra ativa encontrada</p>
              <p className="text-gray-500">Peça ao administrador para cadastrar obras.</p>
            </CardContent>
          </Card>
        ) : (
          obras.map((obra) => (
            <Card 
              key={obra.id} 
              className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group overflow-hidden"
              onClick={() => navigate(`/obras/${obra.id}/presenca`)}
            >
              <div className="flex items-center p-6">
                <div className="bg-blue-50 p-4 rounded-xl text-blue-900 mr-5 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                  <Building2 size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{obra.nome}</h3>
                  {obra.endereco && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{obra.endereco}</p>}
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={24} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
