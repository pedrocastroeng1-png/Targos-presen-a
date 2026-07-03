import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle2, XCircle, DollarSign, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFuncionarios: 0,
    presentesHoje: 0,
    faltasHoje: 0,
    gastoHoje: 0,
    gastoMes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const startOfMonth = format(new Date(), 'yyyy-MM-01');

      // 1. Total Funcionários
      const { count: totalFunc } = await supabase
        .from('funcionarios')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ATIVO');

      // 2. Presentes e Faltas Hoje
      const { data: presencasHoje } = await supabase
        .from('presencas')
        .select('status, valor_pago')
        .eq('data', today);

      let presentes = 0;
      let faltas = 0;
      let gastoHoje = 0;

      presencasHoje?.forEach(p => {
        if (p.status === 'PRESENTE') presentes++;
        if (p.status === 'FALTOU') faltas++;
        gastoHoje += Number(p.valor_pago || 0);
      });

      // 3. Gasto Mês
      const { data: presencasMes } = await supabase
        .from('presencas')
        .select('valor_pago')
        .gte('data', startOfMonth);

      const gastoMes = presencasMes?.reduce((acc, curr) => acc + Number(curr.valor_pago || 0), 0) || 0;

      setStats({
        totalFuncionarios: totalFunc || 0,
        presentesHoje: presentes,
        faltasHoje: faltas,
        gastoHoje,
        gastoMes
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2">Visão geral do dia {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-900">
              <Users size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Funcionários Ativos</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalFuncionarios}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-green-100 p-4 rounded-xl text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Presentes Hoje</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.presentesHoje}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-red-100 p-4 rounded-xl text-red-600">
              <XCircle size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Faltaram Hoje</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.faltasHoje}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-emerald-100 p-4 rounded-xl text-emerald-700">
              <DollarSign size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Gasto Hoje</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.gastoHoje)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-blue-950 p-4 rounded-xl text-white">
              <Activity size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Gasto Mês</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.gastoMes)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Aqui poderíamos adicionar o Recharts depois */}
      <div className="mt-8 text-center text-gray-400 p-12 border-2 border-dashed rounded-xl">
        Gráficos detalhados serão exibidos aqui na próxima versão
      </div>
    </div>
  );
}
