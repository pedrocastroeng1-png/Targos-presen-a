import fs from 'fs';
let content = fs.readFileSync('src/pages/TurnoSelection.tsx', 'utf8');

content = content.replace(/\.from\('obras'\)/g, ".from('projects')");
content = content.replace(/import \{ Obra \} from '@\/types';/, "import { Project } from '@/types';");
content = content.replace(/<Obra \| null>/g, "<Project | null>");
content = content.replace(/obra\?\.nome/g, "obra?.name");

fs.writeFileSync('src/pages/TurnoSelection.tsx', content);
