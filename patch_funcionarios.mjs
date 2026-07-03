import fs from 'fs';

let content = fs.readFileSync('src/pages/AdminFuncionarios.tsx', 'utf8');

// 1. Remove `valor_diaria` from form and `valorDiaria` state
content = content.replace(/const \[valorDiaria, setValorDiaria\] = useState\(''\);\n/, '');
content = content.replace(/setValorDiaria\(f\.valor_diaria\.toString\(\)\);\n/, '');
content = content.replace(/setValorDiaria\(''\);\n/, '');

// 2. Adjust payload
content = content.replace(/valor_diaria: Number\(valorDiaria\),/, 'valor_diaria: 0,');

// 3. Remove "Valor Diária" input
content = content.replace(/<div className="space-y-2">\s*<Label>Valor Diária \(R\$\)<\/Label>\s*<Input type="number" step="0\.01" value={valorDiaria} onChange={e => setValorDiaria\(e\.target\.value\)} required \/>\s*<\/div>/, '');

// 4. Change "Função" to "Cargo"
content = content.replace(/<Label>Função<\/Label>/g, '<Label>Cargo</Label>');

fs.writeFileSync('src/pages/AdminFuncionarios.tsx', content);
