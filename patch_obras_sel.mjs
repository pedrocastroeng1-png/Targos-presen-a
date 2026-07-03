import fs from 'fs';
let content = fs.readFileSync('src/pages/ObrasSelection.tsx', 'utf8');

// Replace .from('obras') with .from('projects')
content = content.replace(/\.from\('obras'\)/g, ".from('projects')");
content = content.replace(/import \{ Obra \} from '@\/types';/, "import { Project } from '@/types';");
content = content.replace(/Obra\[\]/g, "Project[]");
content = content.replace(/obra\.nome/g, "obra.name");
content = content.replace(/obra\.endereco/g, "obra.address");
content = content.replace(/eq\('status', 'ATIVA'\)/g, "eq('active', true)");
content = content.replace(/\.order\('nome'\)/g, ".order('name')");

fs.writeFileSync('src/pages/ObrasSelection.tsx', content);
