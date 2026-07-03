import fs from 'fs';
let content = fs.readFileSync('src/pages/Relatorios.tsx', 'utf8');

const fetchOld = `        .from('presencas')
        .select(\`
          data,
          status,
          valor_pago,
          observacao,
          funcionarios (nome, funcao),
          obras (nome)
        \`)
        .gte('data', dataInicial)
        .lte('data', dataFinal)
        .order('data', { ascending: true });`;
const fetchNew = `        .from('attendance_sessions')
        .select(\`
          attendance_date,
          project:projects (name),
          items:attendance_items (
            status,
            observation,
            daily_factor,
            employee:employees (
              full_name,
              position:positions (name)
            )
          )
        \`)
        .gte('attendance_date', dataInicial)
        .lte('attendance_date', dataFinal)
        .order('attendance_date', { ascending: true });`;

content = content.replace(fetchOld, fetchNew);

// Since we fetched attendance_sessions, we need to flatten the items for Excel and PDF.
const formatExcelOld = `    const formattedData = data.map((row: any) => ({
      Data: format(new Date(row.data), 'dd/MM/yyyy'),
      Funcionário: row.funcionarios?.nome || 'N/A',
      Cargo: row.funcionarios?.funcao || 'N/A',
      Obra: row.obras?.nome || 'N/A',
      Status: row.status,
      'Valor Pago': row.valor_pago,
      Observação: row.observacao || ''
    }));`;
const formatExcelNew = `    const formattedData: any[] = [];
    data.forEach((session: any) => {
      session.items?.forEach((item: any) => {
        formattedData.push({
          Data: format(new Date(session.attendance_date), 'dd/MM/yyyy'),
          Funcionário: item.employee?.full_name || 'N/A',
          Cargo: item.employee?.position?.name || 'N/A',
          Obra: session.project?.name || 'N/A',
          Status: item.status,
          'Fator Diária': item.daily_factor,
          Observação: item.observation || ''
        });
      });
    });`;
content = content.replace(formatExcelOld, formatExcelNew);

const formatPdfOld = `    const tableData = data.map((row: any) => [
      format(new Date(row.data), 'dd/MM/yyyy'),
      row.funcionarios?.nome || 'N/A',
      row.obras?.nome || 'N/A',
      row.status,
      \`R$ \${row.valor_pago}\`,
      row.observacao || ''
    ]);`;
const formatPdfNew = `    const tableData: any[] = [];
    data.forEach((session: any) => {
      session.items?.forEach((item: any) => {
        tableData.push([
          format(new Date(session.attendance_date), 'dd/MM/yyyy'),
          item.employee?.full_name || 'N/A',
          session.project?.name || 'N/A',
          item.status,
          \`\${item.daily_factor}\`,
          item.observation || ''
        ]);
      });
    });`;
content = content.replace(formatPdfOld, formatPdfNew);

// Head fix for PDF
content = content.replace(/head: \[\['Data', 'Funcionário', 'Obra', 'Status', 'Valor', 'Obs'\]\],/, "head: [['Data', 'Funcionário', 'Obra', 'Status', 'Fator', 'Obs']],");

fs.writeFileSync('src/pages/Relatorios.tsx', content);
