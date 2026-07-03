import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminObras.tsx', 'utf8');

// Replace .from('obras') with .from('projects')
content = content.replace(/\.from\('obras'\)/g, ".from('projects')");
content = content.replace(/import \{ Obra \} from '@\/types';/, "import { Project } from '@/types';");
content = content.replace(/Obra\[\]/g, "Project[]");
content = content.replace(/\(o\?: Obra\)/g, "(o?: Project)");
content = content.replace(/status: o\.status/g, "active: o.active");
content = content.replace(/setStatus\('ATIVA'\)/g, "setActive(true)");
content = content.replace(/const \[status, setStatus\] = useState<'ATIVA' \| 'INATIVA'>\('ATIVA'\);/, "const [active, setActive] = useState(true);");
content = content.replace(/const payload = \{ nome, endereco, status \};/, "const payload = { name: nome, address: endereco, active };");
content = content.replace(/setStatus\(o\.status\)/, "setActive(o.active)");

// the template rendering
content = content.replace(/o\.nome/g, "o.name");
content = content.replace(/o\.endereco/g, "o.address");
content = content.replace(/o\.status === 'ATIVA'/g, "o.active");
content = content.replace(/o\.status/g, "(o.active ? 'Ativa' : 'Inativa')");

// form rendering
content = content.replace(/value=\{status\}/, "value={active ? 'true' : 'false'}");
content = content.replace(/onChange=\{e => setStatus\(e\.target\.value as 'ATIVA' \| 'INATIVA'\)\}/, "onChange={e => setActive(e.target.value === 'true')}");
content = content.replace(/<option value="ATIVA">Ativa<\/option>/, '<option value="true">Ativa</option>');
content = content.replace(/<option value="INATIVA">Inativa<\/option>/, '<option value="false">Inativa</option>');

fs.writeFileSync('src/pages/AdminObras.tsx', content);
