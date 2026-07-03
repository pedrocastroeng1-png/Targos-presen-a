import fs from 'fs';

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/types.ts', {
    "obra_nome": "project_name"
});

replaceInFile('src/pages/Home.tsx', {
    "...obra,": "...project,"
});

replaceInFile('src/pages/Relatorios.tsx', {
    "Obra:": "Projeto:",
    "'Obra'": "'Projeto'"
});

replaceInFile('src/pages/ProjectsSelection.tsx', {
    "obra ": "projeto ",
    "obra)": "project)"
});

replaceInFile('src/services/supabase/storage.ts', {
    "obraId:": "projectId:",
    "metadata.obraId": "metadata.projectId"
});

console.log("Fixed remaining.");
