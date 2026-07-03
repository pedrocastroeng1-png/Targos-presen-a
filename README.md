# TARGOS PRESENÇA

Sistema completo para controle de presença em obras, substituindo planilhas Excel.

## Tecnologias

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
- **Backend:** Supabase (PostgreSQL, Auth).
- **Exportação:** Excel (xlsx), PDF (jsPDF).

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. Execute o código SQL disponível em `supabase_schema.md` no SQL Editor do Supabase.
3. Obtenha a URL e a Anon Key nas configurações de API do projeto.
4. Adicione as chaves em um arquivo `.env` (baseado no `.env.example`).

## Como Rodar

```bash
npm install
npm run dev
```

## Níveis de Acesso

- **Operador:** Apenas registra presença.
- **Administrador:** Cadastra obras, funcionários, gera relatórios e gerencia o sistema.
O primeiro usuário criado no Supabase será automaticamente um Administrador.

## PWA
Para instalar como PWA, basta utilizar as opções nativas do navegador (Chrome/Safari) para "Adicionar à Tela Inicial". A aplicação é 100% responsiva.
