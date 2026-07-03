import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminUsuarios.tsx', 'utf8');

// Replace .from('usuarios') with .from('profiles')
content = content.replace(/\.from\('usuarios'\)/g, ".from('profiles')");
content = content.replace(/name: nome,/g, "full_name: nome,");
content = content.replace(/name/g, "full_name");
content = content.replace(/import \{ Profile \} from '@\/types';/g, "import { Profile } from '@/types';");
content = content.replace(/u\.full_name/g, "u.full_name"); // Already did the replace, but be careful

fs.writeFileSync('src/pages/AdminUsuarios.tsx', content);
