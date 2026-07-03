import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Funcionario, Obra } from '@/types';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, Building, UserSquare2, ChevronLeft, UserMinus, Timer, Check, Users } from 'lucide-react';

export default function PresencaFlow() {
  const { id: obraId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [obra, setObra] = useState<Obra | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Real-time clock
  const [now, setNow] = useState(new Date());

  // Faltou Modal State
  const [isFaltouModalOpen, setIsFaltouModalOpen] = useState(false);
  const [observacao, setObservacao] = useState('');
  
  // Desligado Modal State
  const [isDesligadoModalOpen, setIsDesligadoModalOpen] = useState(false);

  // Completion state
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Tracking Stats
  const [sessionStartTime] = useState(new Date());
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [summary, setSummary] = useState({
    presentes: 0,
    faltas: 0,
    desligados: 0
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (obraId) {
      fetchData();
    }
  }, [obraId]);

  const fetchData = async () => {
    try {
      // 1. Fetch Obra
      const { data: obraData, error: obraError } = await supabase
        .from('obras')
        .select('*')
        .eq('id', obraId)
        .single();
        
      if (obraError) throw obraError;
      setObra(obraData);

      // 2. Fetch Funcionários Ativos dessa obra
      const { data: funcData, error: funcError } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('obra_id', obraId)
        .eq('status', 'ATIVO')
        .order('nome');

      if (funcError) throw funcError;
      
      // 3. Filter out those who already have a presence recorded today
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: presencasData, error: presencasError } = await supabase
        .from('presencas')
        .select('funcionario_id')
        .eq('obra_id', obraId)
        .eq('data', today);
        
      if (presencasError) throw presencasError;
      
      const funcionariosComPresencaHoje = new Set(presencasData.map(p => p.funcionario_id));
      const pendingFuncionarios = funcData.filter(f => !funcionariosComPresencaHoje.has(f.id));

      setFuncionarios(pendingFuncionarios);
      if (pendingFuncionarios.length === 0) {
        finishFlow();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const currentFuncionario = funcionarios[currentIndex];

  const finishFlow = () => {
    setSessionEndTime(new Date());
    setIsCompleted(true);
  };

  const getDurationString = () => {
    if (!sessionEndTime) return '';
    const minutes = differenceInMinutes(sessionEndTime, sessionStartTime);
    const seconds = differenceInSeconds(sessionEndTime, sessionStartTime) % 60;
    
    if (minutes === 0) return `${seconds} segundos`;
    return `${minutes} min e ${seconds} seg`;
  };

  const advanceToNext = () => {
    if (currentIndex < funcionarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishFlow();
    }
  };

  const handlePresente = async () => {
    if (!currentFuncionario || !user || !obraId) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm:ss');
      
      const { error } = await supabase.from('presencas').insert({
        funcionario_id: currentFuncionario.id,
        obra_id: obraId,
        data: today,
        hora: time,
        usuario_id: user.id,
        status: 'PRESENTE',
        valor_pago: currentFuncionario.valor_diaria,
      });

      if (error) throw error;
      
      setSummary(s => ({ ...s, presentes: s.presentes + 1 }));
      advanceToNext();
    } catch (error: any) {
      console.error('Error recording presence:', error);
      alert('Erro ao registrar presença: ' + error.message);
    }
  };

  const openFaltouModal = () => {
    setObservacao('');
    setIsFaltouModalOpen(true);
  };

  const handleFaltou = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFuncionario || !user || !obraId) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm:ss');
      
      const { error } = await supabase.from('presencas').insert({
        funcionario_id: currentFuncionario.id,
        obra_id: obraId,
        data: today,
        hora: time,
        usuario_id: user.id,
        status: 'FALTOU',
        valor_pago: 0,
        observacao: observacao || undefined,
      });

      if (error) throw error;
      
      setSummary(s => ({ ...s, faltas: s.faltas + 1 }));
      setIsFaltouModalOpen(false);
      advanceToNext();
    } catch (error: any) {
      console.error('Error recording absence:', error);
      alert('Erro ao registrar falta: ' + error.message);
    }
  };

  const confirmDesligamento = async () => {
    if (!currentFuncionario || !user || !obraId) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase.from('funcionarios').update({
        status: 'DESLIGADO',
        data_desligamento: today,
        usuario_desligamento_id: user.id
      }).eq('id', currentFuncionario.id);

      if (error) throw error;
      
      setSummary(s => ({ ...s, desligados: s.desligados + 1 }));
      setIsDesligadoModalOpen(false);
      advanceToNext();
    } catch (error: any) {
      console.error('Error handling desligamento:', error);
      alert('Erro ao desligar funcionário: ' + error.message);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;

  if (isCompleted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto">
        <div className="bg-green-100 p-6 rounded-full text-green-600 mb-4 animate-in zoom-in duration-500">
          <CheckCircle2 size={80} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Sucesso!</h2>
          <p className="text-xl text-gray-600">Presença concluída com sucesso.</p>
        </div>

        {/* Resumo */}
        <Card className="w-full text-left shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <Users className="mr-2" size={18} /> Resumo
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium flex items-center"><Check className="text-green-500 mr-2" size={18} /> Presentes</span>
                <span className="font-bold text-lg text-gray-900">{summary.presentes}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium flex items-center"><XCircle className="text-red-500 mr-2" size={18} /> Faltaram</span>
                <span className="font-bold text-lg text-gray-900">{summary.faltas}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium flex items-center"><UserMinus className="text-orange-500 mr-2" size={18} /> Desligados</span>
                <span className="font-bold text-lg text-gray-900">{summary.desligados}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg mt-2 border border-blue-100">
                <span className="text-blue-900 font-medium flex items-center"><Timer className="text-blue-600 mr-2" size={18} /> Tempo gasto</span>
                <span className="font-bold text-lg text-blue-900">{getDurationString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={() => navigate('/')}
          className="w-full h-16 text-xl font-bold rounded-xl shadow-xl mt-4"
          size="lg"
        >
          Voltar para Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Header Box */}
      <div className="bg-blue-950 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Building size={120} />
        </div>
        <button 
          onClick={() => navigate('/obras')}
          className="flex items-center text-blue-200 hover:text-white mb-6 text-sm font-medium transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Voltar
        </button>
        
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Building className="mr-3 text-blue-400" size={28} />
          {obra?.nome}
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-900/50 p-4 rounded-xl border border-blue-800/50 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="bg-blue-800 p-2 rounded-lg mr-3">
              <CheckCircle2 size={20} className="text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Data</p>
              <p className="font-semibold text-lg">{format(now, "dd/MM/yyyy")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-500 px-2">
        <span>Funcionário {currentIndex + 1} de {funcionarios.length}</span>
        <div className="flex-1 ml-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((currentIndex) / funcionarios.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Employee Card */}
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden mt-8">
        <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-100 text-blue-900 p-5 rounded-full mb-2">
              <UserSquare2 size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentFuncionario?.nome}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">
                {currentFuncionario?.funcao}
              </span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Button
              onClick={handlePresente}
              variant="success"
              className="h-20 text-xl font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
            >
              <CheckCircle2 size={28} className="mr-3" />
              PRESENTE
            </Button>
            
            <Button
              onClick={openFaltouModal}
              variant="destructive"
              className="h-20 text-xl font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
            >
              <XCircle size={28} className="mr-3" />
              FALTOU
            </Button>
          </div>

          <div className="border-t pt-6 text-center">
            <Button
              onClick={() => setIsDesligadoModalOpen(true)}
              variant="ghost"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium w-full"
            >
              <UserMinus size={16} className="mr-2" />
              DESLIGADO DA EMPRESA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Faltou Modal */}
      <Dialog open={isFaltouModalOpen} onOpenChange={setIsFaltouModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600 flex items-center">
              <XCircle className="mr-2" /> Motivo da Falta
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFaltou} className="space-y-6 py-4">
            <div className="space-y-4">
              <Label htmlFor="motivo" className="text-base">Selecione ou digite o motivo:</Label>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['Doença', 'Atestado', 'Problema familiar', 'Sem transporte', 'Outro'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setObservacao(preset)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      observacao === preset 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <Input
                id="motivo"
                placeholder="Ou digite o motivo detalhado aqui..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="h-14"
                autoFocus
              />
            </div>
            <DialogFooter className="sm:justify-between gap-3 flex-col sm:flex-row">
              <Button type="button" variant="outline" className="w-full h-12" onClick={() => setIsFaltouModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" className="w-full h-12 text-base font-bold">
                Salvar Falta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Desligado Modal */}
      <Dialog open={isDesligadoModalOpen} onOpenChange={setIsDesligadoModalOpen}>
        <DialogContent className="sm:max-w-md border-orange-200 bg-orange-50">
          <DialogHeader>
            <DialogTitle className="text-2xl text-orange-700 flex items-center">
              <UserMinus className="mr-2" /> ATENÇÃO
            </DialogTitle>
            <DialogDescription className="text-orange-900 pt-4 text-lg">
              Deseja realmente desligar este colaborador?
              <br /><br />
              Ele deixará de aparecer nas próximas listas de presença.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button type="button" variant="outline" className="w-full h-14 bg-white" onClick={() => setIsDesligadoModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={confirmDesligamento}
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

