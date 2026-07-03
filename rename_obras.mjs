import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content);
}

// App.tsx
replaceInFile('src/App.tsx', {
    "ObrasSelection": "ProjectsSelection",
    "AdminObras": "AdminProjects",
    "/obras": "/projects"
});

// Layout.tsx
replaceInFile('src/components/Layout.tsx', {
    "'/obras'": "'/projects'",
    "'/admin/obras'": "'/admin/projects'",
    "Obras": "Projetos"
});

// Home.tsx
replaceInFile('src/pages/Home.tsx', {
    "obrasStatus": "projectsStatus",
    "setObrasStatus": "setProjectsStatus",
    "fetchObrasStatus": "fetchProjectsStatus",
    "obra.id": "project.id",
    "obra.name": "project.name",
    "obra.manha": "project.manha",
    "obra.tarde": "project.tarde",
    "obra =>": "project =>",
    "'/obras'": "'/projects'"
});

// ProjectsSelection.tsx
replaceInFile('src/pages/ProjectsSelection.tsx', {
    "ObrasSelection": "ProjectsSelection",
    "obras": "projects",
    "setObras": "setProjects",
    "fetchObras": "fetchProjects",
    "obra =>": "project =>",
    "obra.id": "project.id",
    "obra.name": "project.name",
    "obra.address": "project.address",
    "Obra": "Projeto",
    "obras.length": "projects.length",
    "obras.map": "projects.map",
    "obras": "projects", // catch any remaining
    "/obras/": "/projects/",
    "Obras": "Projetos"
});

// AdminProjects.tsx
replaceInFile('src/pages/AdminProjects.tsx', {
    "AdminObras": "AdminProjects",
    "obras": "projects",
    "setObras": "setProjects",
    "fetchObras": "fetchProjects",
    "Obra": "Projeto",
    "Obras": "Projetos",
    "obra": "project"
});

// AdminFuncionarios.tsx
replaceInFile('src/pages/AdminFuncionarios.tsx', {
    "obras": "projects",
    "setObras": "setProjects",
    "fetchObras": "fetchProjects",
    "Obra": "Projeto",
    "Obras": "Projetos",
    "obra": "project"
});

// TurnoSelection.tsx
replaceInFile('src/pages/TurnoSelection.tsx', {
    "obraId": "projectId",
    "obra": "project",
    "setObra": "setProject",
    "Obra": "Projeto",
    "/obras/": "/projects/"
});

// PresencaFlow.tsx
replaceInFile('src/pages/PresencaFlow.tsx', {
    "obraId": "projectId",
    "obra": "project",
    "setObra": "setProject",
    "Obra": "Projeto",
    "/obras": "/projects"
});

// AdminAuditoria.tsx
replaceInFile('src/pages/AdminAuditoria.tsx', {
    "obra_nome": "project_name",
    "obra": "project",
    "Obra": "Projeto",
});

console.log("Renaming done.");
