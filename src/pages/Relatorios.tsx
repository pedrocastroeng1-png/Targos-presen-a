import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export default function Relatorios() {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRelatorioData = async () => {
    if (!dataInicial || !dataFinal) {
      alert("Selecione as datas");
      return null;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('presencas')
        .select(`
          data,
          status,
          valor_pago,
          observacao,
          funcionarios (nome, funcao),
          obras (nome)
        `)
        .gte('data', dataInicial)
        .lte('data', dataFinal)
        .order('data', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Erro ao gerar relatório');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    const data = await fetchRelatorioData();
    if (!data || data.length === 0) return alert('Sem dados para este período');

    const formattedData = data.map((row: any) => ({
      Data: format(new Date(row.data), 'dd/MM/yyyy'),
      Funcionário: row.funcionarios?.nome || 'N/A',
      Função: row.funcionarios?.funcao || 'N/A',
      Obra: row.obras?.nome || 'N/A',
      Status: row.status,
      'Valor Pago': row.valor_pago,
      Observação: row.observacao || ''
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Presenças");
    XLSX.writeFile(wb, `Relatorio_Presenca_${dataInicial}_a_${dataFinal}.xlsx`);
  };

  const exportPDF = async () => {
    const data = await fetchRelatorioData();
    if (!data || data.length === 0) return alert('Sem dados para este período');

    const doc = new jsPDF();
    doc.text(`Relatório de Presenças (${format(new Date(dataInicial), 'dd/MM/yyyy')} a ${format(new Date(dataFinal), 'dd/MM/yyyy')})`, 14, 15);

    const tableData = data.map((row: any) => [
      format(new Date(row.data), 'dd/MM/yyyy'),
      row.funcionarios?.nome || 'N/A',
      row.obras?.nome || 'N/A',
      row.status,
      `R$ ${row.valor_pago}`,
      row.observacao || ''
    ]);

    autoTable(doc, {
      head: [['Data', 'Funcionário', 'Obra', 'Status', 'Valor', 'Obs']],
      body: tableData,
      startY: 25,
    });

    doc.save(`Relatorio_Presenca_${dataInicial}_a_${dataFinal}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Relatórios</h1>
        <p className="text-gray-500 mt-2">Gere relatórios de presença por período e exporte em PDF ou Excel.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-inicial">Data Inicial</Label>
              <Input
                id="data-inicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-final">Data Final</Label>
              <Input
                id="data-final"
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={exportPDF} disabled={loading || !dataInicial || !dataFinal} className="flex-1 h-12 bg-red-600 hover:bg-red-700">
              <Download className="mr-2 h-5 w-5" /> Exportar PDF
            </Button>
            <Button onClick={exportExcel} disabled={loading || !dataInicial || !dataFinal} className="flex-1 h-12 bg-green-600 hover:bg-green-700">
              <FileSpreadsheet className="mr-2 h-5 w-5" /> Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
