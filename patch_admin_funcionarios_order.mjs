import fs from 'fs';

let content = fs.readFileSync('src/pages/AdminFuncionarios.tsx', 'utf8');

content = content.replace(
  /\.order\('nome'\),/g,
  ".order('nome', { ascending: true }),"
);

fs.writeFileSync('src/pages/AdminFuncionarios.tsx', content);
