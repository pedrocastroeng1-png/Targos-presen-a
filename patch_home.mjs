import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace .from('obras') with .from('projects')
content = content.replace(/\.from\('obras'\)/g, ".from('projects')");
content = content.replace(/obra\.nome/g, "obra.name");
content = content.replace(/eq\('status', 'ATIVA'\)/g, "eq('active', true)");
content = content.replace(/\.order\('nome'\)/g, ".order('name')");

fs.writeFileSync('src/pages/Home.tsx', content);
