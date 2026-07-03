import fs from 'fs';

// 1. Dashboard.tsx
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace(/\.from\('funcionarios'\)/g, ".from('employees')");
content = content.replace(/\.from\('presencas'\)/g, ".from('attendance_items')");
content = content.replace(/\.from\('obras'\)/g, ".from('projects')");
fs.writeFileSync('src/pages/Dashboard.tsx', content);

// 2. AdminFuncionarios.tsx
content = fs.readFileSync('src/pages/AdminFuncionarios.tsx', 'utf8');
content = content.replace(/\.from\('funcionarios'\)/g, ".from('employees')");
fs.writeFileSync('src/pages/AdminFuncionarios.tsx', content);

// 3. PresencaFlow.tsx
content = fs.readFileSync('src/pages/PresencaFlow.tsx', 'utf8');
content = content.replace(/\.from\('funcionarios'\)/g, ".from('employees')");
fs.writeFileSync('src/pages/PresencaFlow.tsx', content);
