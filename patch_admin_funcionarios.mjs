import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminFuncionarios.tsx', 'utf8');

content = content.replace(/import \{ Funcionario, Obra \} from '@\/types';/, "import { Employee, Project, Position } from '@/types';");

content = content.replace(/const \[funcionarios, setFuncionarios\] = useState<Funcionario\[\]>\(\[\]\);/, "const [funcionarios, setFuncionarios] = useState<Employee[]>([]);\n  const [positions, setPositions] = useState<Position[]>([]);");
content = content.replace(/const \[obras, setObras\] = useState<Obra\[\]>\(\[\]\);/, "const [obras, setObras] = useState<Project[]>([]);");
content = content.replace(/const \[status, setStatus\] = useState<'ATIVO' \| 'INATIVO'>\('ATIVO'\);/, "const [active, setActive] = useState(true);");

const fetchOld = `        supabase.from('funcionarios').select('*').order('nome', { ascending: true }),
        supabase.from('obras').select('*').order('nome')
      ]);`;
const fetchNew = `        supabase.from('employees').select('*, position:positions(name)').order('full_name', { ascending: true }),
        supabase.from('projects').select('*').order('name'),
        supabase.from('positions').select('*').order('name')
      ]);`;
content = content.replace(fetchOld, fetchNew);

const fDataOld = `      setFuncionarios(fData || []);
      setObras(oData || []);`;
const fDataNew = `      setFuncionarios(fData || []);
      setObras(oData || []);
      // @ts-ignore - positionData is available in the array
      setPositions(arguments[0]?.[2]?.data || []);`;
// Actually, let's fix the array destructuring.
content = content.replace(/const \[\{ data: fData \}, \{ data: oData \}\] = await Promise\.all\(\[/, "const [{ data: fData }, { data: oData }, { data: posData }] = await Promise.all([");
content = content.replace(/setFuncionarios\(fData \|\| \[\]\);\n\s*setObras\(oData \|\| \[\]\);/, "setFuncionarios(fData || []);\n      setObras(oData || []);\n      setPositions(posData || []);");

content = content.replace(/const openModal = \(f\?: Funcionario\) => \{/g, "const openModal = (f?: Employee) => {");
const openModalOld = `    if (f) {
      setEditingId(f.id);
      setNome(f.nome);
      setFuncao(f.funcao);
      
      setObraId(f.obra_id);
      setStatus(f.status);
    } else {
      setEditingId(null);
      setNome('');
      setFuncao('');
      
      setObraId(obras[0]?.id || '');
      setStatus('ATIVO');
    }`;
const openModalNew = `    if (f) {
      setEditingId(f.id);
      setNome(f.full_name);
      setFuncao(f.position_id);
      setObraId(f.project_id);
      setActive(f.active);
    } else {
      setEditingId(null);
      setNome('');
      setFuncao(positions[0]?.id || '');
      setObraId(obras[0]?.id || '');
      setActive(true);
    }`;
content = content.replace(openModalOld, openModalNew);

const payloadOld = `      const payload = {
        nome,
        funcao,
        valor_diaria: 0,
        obra_id: obraId,
        status
      };
      if (editingId) {
        await supabase.from('funcionarios').update(payload).eq('id', editingId);
      } else {
        await supabase.from('funcionarios').insert([payload]);
      }`;
const payloadNew = `      const payload = {
        full_name: nome,
        position_id: funcao,
        project_id: obraId,
        active
      };
      if (editingId) {
        await supabase.from('employees').update(payload).eq('id', editingId);
      } else {
        await supabase.from('employees').insert([payload]);
      }`;
content = content.replace(payloadOld, payloadNew);

content = content.replace(/await supabase\.from\('funcionarios'\)\.delete\(\)\.eq\('id', id\);/, "await supabase.from('employees').delete().eq('id', id);");

content = content.replace(/const obra = obras\.find\(o => o\.id === f\.obra_id\);/g, "const obra = obras.find(o => o.id === f.project_id);\n          const pos = positions.find(p => p.id === f.position_id);");
content = content.replace(/<h3 className="font-bold text-lg">\{f\.nome\}<\/h3>/g, '<h3 className="font-bold text-lg">{f.full_name}</h3>');
content = content.replace(/<span>\{f\.funcao\}<\/span>/g, "<span>{pos?.name || 'Cargo não encontrado'}</span>");
content = content.replace(/<span>\{obra\?\.nome \|\| 'Obra não encontrada'\}<\/span>/g, "<span>{obra?.name || 'Obra não encontrada'}</span>");
content = content.replace(/<span className=\{f\.status === 'ATIVO' \? 'text-green-600' : 'text-red-600'\}>\{f\.status\}<\/span>/g, "<span className={f.active ? 'text-green-600' : 'text-red-600'}>{f.active ? 'ATIVO' : 'INATIVO'}</span>");

content = content.replace(/<Input value=\{funcao\} onChange=\{e => setFuncao\(e\.target\.value\)\} required \/>/, 
  `<select className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm" value={funcao} onChange={e => setFuncao(e.target.value)} required>
                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>`);
              
content = content.replace(/\{obras\.map\(o => <option key=\{o\.id\} value=\{o\.id\}>\{o\.nome\}<\/option>\)\}/, "{obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}");

content = content.replace(/value=\{status\} onChange=\{e => setStatus\(e\.target\.value as 'ATIVO' \| 'INATIVO'\)\} required/g, "value={active ? 'true' : 'false'} onChange={e => setActive(e.target.value === 'true')} required");
content = content.replace(/<option value="ATIVO">Ativo<\/option>/, '<option value="true">Ativo</option>');
content = content.replace(/<option value="INATIVO">Inativo<\/option>/, '<option value="false">Inativo</option>');

fs.writeFileSync('src/pages/AdminFuncionarios.tsx', content);
