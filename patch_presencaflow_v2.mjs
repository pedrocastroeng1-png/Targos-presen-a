import fs from 'fs';
let content = fs.readFileSync('src/pages/PresencaFlow.tsx', 'utf8');

// Types
content = content.replace(/import \{ Funcionario, Obra, GeoLocation \} from '@\/types';/g, "import { Employee, Project, GeoLocation } from '@/types';");
content = content.replace(/import \{ Obra \} from '@\/types';/g, "import { Project, Employee, GeoLocation } from '@/types';"); // Just in case it was modified

content = content.replace(/<Obra \| null>/g, "<Project | null>");
content = content.replace(/<Funcionario\[\]>/g, "<Employee[]>");

// State and references
content = content.replace(/setObra\(obraData\);/g, "setObra(obraData);\n      // Find shift\n      const shiftName = turno === 'MANHA' ? 'MANHÃ' : 'TARDE';\n      const { data: shiftData } = await supabase.from('shifts').select('*').eq('name', shiftName).single();\n      setShiftId(shiftData?.id);\n");
content = content.replace(/const \[obra, setObra\] = useState<Project \| null>\(null\);/g, "const [obra, setObra] = useState<Project | null>(null);\n  const [shiftId, setShiftId] = useState<string | null>(null);\n  const [sessionId, setSessionId] = useState<string | null>(null);");

const fetchOld = `      const { data: funcData, error: funcError } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('obra_id', obraId)
        .eq('status', 'ATIVO')
        .order('nome', { ascending: true });`;
const fetchNew = `      const { data: funcData, error: funcError } = await supabase
        .from('employees')
        .select('*, position:positions(name)')
        .eq('project_id', obraId)
        .eq('active', true)
        .order('full_name', { ascending: true });`;
content = content.replace(fetchOld, fetchNew);

const finishFlowOld = `    const today = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(\`turno_\${obraId}_\${today}_\${turno}\`, 'true');`;
const finishFlowNew = `    const today = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(\`turno_\${obraId}_\${today}_\${turno}\`, 'true');
    if (sessionId) {
      supabase.from('attendance_sessions').update({
        status: 'FINALIZADA',
        finished_at: new Date().toISOString(),
        registered_employees: summary.presentes + summary.faltas
      }).eq('id', sessionId).then();
    }`;
content = content.replace(finishFlowOld, finishFlowNew);

const savePresencaDBOld = `      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm:ss');
      
      const { data: existing } = await supabase
        .from('presencas')
        .select('id')
        .eq('funcionario_id', currentFuncionario.id)
        .eq('data', today)
        .single();

      if (existing) {
        const updateData: any = {
          status: 'PRESENTE',
          valor_pago: 0,
          usuario_id: user.id,
          hora: time
        };
        if (photoPath) updateData.foto_path = photoPath;
        const { error } = await supabase.from('presencas').update(updateData).eq('id', existing.id);
        if (error) throw error;
      } else {
        const insertData: any = {
          funcionario_id: currentFuncionario.id,
          obra_id: obraId,
          data: today,
          hora: time,
          usuario_id: user.id,
          status: 'PRESENTE',
          valor_pago: 0,
        };
        if (photoPath) insertData.foto_path = photoPath;
        const { error } = await supabase.from('presencas').insert(insertData);
        if (error) throw error;
      }`;
      
const savePresencaDBNew = `      const today = format(new Date(), 'yyyy-MM-dd');
      let currentSessionId = sessionId;

      if (!currentSessionId && shiftId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('attendance_sessions')
          .insert({
            project_id: obraId,
            shift_id: shiftId,
            operator_id: user.id,
            attendance_date: today,
            expected_employees: funcionarios.length,
            status: 'EM_ANDAMENTO'
          }).select('id').single();
        
        if (sessionData) {
          currentSessionId = sessionData.id;
          setSessionId(currentSessionId);
        } else if (sessionError && sessionError.code === '23505') {
            const { data: existSess } = await supabase.from('attendance_sessions')
              .select('id').eq('project_id', obraId).eq('shift_id', shiftId).eq('attendance_date', today).single();
            if (existSess) {
               currentSessionId = existSess.id;
               setSessionId(currentSessionId);
            }
        }
      }

      if (!currentSessionId) throw new Error("Could not create session");

      const insertData: any = {
        attendance_session_id: currentSessionId,
        employee_id: currentFuncionario.id,
        status: 'PRESENTE',
        registered_by: user.id,
        registered_at: new Date().toISOString()
      };
      if (photoPath) {
        insertData.photo_path = photoPath;
        insertData.photo_taken_at = new Date().toISOString();
      }
      if (capturedLocation) {
        insertData.latitude = capturedLocation.latitude;
        insertData.longitude = capturedLocation.longitude;
        insertData.gps_accuracy = capturedLocation.accuracy;
      }
      
      const { error } = await supabase.from('attendance_items').insert(insertData);
      if (error && error.code !== '23505') throw error; // Ignore if already registered
`;
content = content.replace(savePresencaDBOld, savePresencaDBNew);

const handleFaltouOld = `      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm:ss');
      
      const { data: existing } = await supabase
        .from('presencas')
        .select('id')
        .eq('funcionario_id', currentFuncionario.id)
        .eq('data', today)
        .single();

      if (existing) {
        const { error } = await supabase.from('presencas').update({
          status: 'FALTOU',
          valor_pago: 0,
          observacao: observacao || undefined,
          usuario_id: user.id,
          hora: time
        }).eq('id', existing.id);
        if (error) throw error;
      } else {
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
      }`;
      
const handleFaltouNew = `      const today = format(new Date(), 'yyyy-MM-dd');
      let currentSessionId = sessionId;

      if (!currentSessionId && shiftId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('attendance_sessions')
          .insert({
            project_id: obraId,
            shift_id: shiftId,
            operator_id: user.id,
            attendance_date: today,
            expected_employees: funcionarios.length,
            status: 'EM_ANDAMENTO'
          }).select('id').single();
        
        if (sessionData) {
          currentSessionId = sessionData.id;
          setSessionId(currentSessionId);
        } else if (sessionError && sessionError.code === '23505') {
            const { data: existSess } = await supabase.from('attendance_sessions')
              .select('id').eq('project_id', obraId).eq('shift_id', shiftId).eq('attendance_date', today).single();
            if (existSess) {
               currentSessionId = existSess.id;
               setSessionId(currentSessionId);
            }
        }
      }

      if (!currentSessionId) throw new Error("Could not create session");

      const insertData: any = {
        attendance_session_id: currentSessionId,
        employee_id: currentFuncionario.id,
        status: 'FALTOU',
        observation: observacao || undefined,
        registered_by: user.id,
        registered_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('attendance_items').insert(insertData);
      if (error && error.code !== '23505') throw error;`;
content = content.replace(handleFaltouOld, handleFaltouNew);

const confirmDesligamentoOld = `    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase.from('funcionarios').update({
        status: 'DESLIGADO',
        data_desligamento: today,
        usuario_desligamento_id: user.id
      }).eq('id', currentFuncionario.id);
      if (error) throw error;`;
      
const confirmDesligamentoNew = `    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase.from('employees').update({
        active: false,
        dismissal_date: today
      }).eq('id', currentFuncionario.id);
      if (error) throw error;`;
content = content.replace(confirmDesligamentoOld, confirmDesligamentoNew);

// UI updates
content = content.replace(/currentFuncionario\?.nome/g, "currentFuncionario?.full_name");
content = content.replace(/currentFuncionario\?.funcao/g, "currentFuncionario?.position?.name");
content = content.replace(/obra\?.nome/g, "obra?.name");
content = content.replace(/\.from\('obras'\)/g, ".from('projects')");
// Update `import { Employee, Project, GeoLocation } from '@/types';` if it's messy
content = content.replace(/import \{\s*Employee, Project, Position\s*\} from '@\/types';/, "import { Employee, Project, Position, GeoLocation } from '@/types';");

fs.writeFileSync('src/pages/PresencaFlow.tsx', content);
