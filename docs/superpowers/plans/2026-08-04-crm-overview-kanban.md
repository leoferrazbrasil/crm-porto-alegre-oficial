# Visão Geral executiva e Pipeline Kanban — Plano de Implementação

> **Para trabalhadores agentic:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** remover os cards legados da Visão Geral e criar uma página `/pipeline` com o funil comercial em Kanban, mantendo as métricas mensais e o registro de mudanças de etapa.

**Architecture:** A Visão Geral permanecerá responsável por aquisição, conversão, receita e meta. O resumo de snapshot (`calculateCrmSummary`) será reaproveitado apenas na nova página Pipeline, que consumirá os leads do Supabase e agrupará todas as etapas oficiais. A navegação será ampliada com um item tipado `Pipeline`, e a interação inicial de movimentação usará o formulário de edição existente, sem dependência de drag-and-drop.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Vitest e CSS existente do CRM.

## Restrições globais

- O topo da Visão Geral não pode reapresentar os seis cards legados.
- A seção mensal de aquisição/conversão/meta continua sendo a fonte única das métricas de conversão.
- `/pipeline` deve exibir as dez etapas de `PIPELINE_STAGES`, inclusive colunas vazias.
- Leads persistidos são a fonte operacional; estado vazio não deve inventar oportunidades.
- Não adicionar biblioteca externa de drag-and-drop nesta etapa.
- Desktop usa colunas; mobile usa seleção de etapa e uma coluna por vez, sem rolagem horizontal do viewport.
- Nenhuma mudança em fórmulas de metas, webhooks ou automações de mensagens.

---

### Task 1: Cobertura de navegação e modelo Kanban

**Files:**
- Modify: `src/components/crm/navigation.test.ts`
- Create: `src/lib/crm/kanban.test.ts`

**Interfaces:**
- `CRM_NAV_ITEMS` deverá incluir `{ id: "pipeline", label: "Pipeline", href: "/pipeline" }`.
- Criar `buildKanbanColumns(leads: Lead[]): KanbanColumn[]`, onde cada coluna contém `stage`, `leads` e `totalValue`.

- [x] Escrever teste falhando que exige o item `Pipeline` no sidebar.
- [x] Escrever teste falhando que exige dez colunas em ordem, inclusive colunas vazias, e uma soma sem duplicar leads.
- [x] Executar `npm test -- src/components/crm/navigation.test.ts src/lib/crm/kanban.test.ts` e observar falhas por item/função ausentes.
- [x] Implementar `buildKanbanColumns` usando `PIPELINE_STAGES` e `groupLeadsByStage` ou uma função específica com a mesma garantia.
- [x] Atualizar a configuração de navegação e o tipo `CrmNavItemId`.
- [x] Executar os dois testes novamente; esperar aprovação.

### Task 2: Limpeza da Visão Geral

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/lib/crm/dashboard.test.ts`

- [x] Escrever teste de contrato textual/estrutural que confirme que a Visão Geral não renderiza os rótulos `Oportunidades ativas`, `Pipeline aberto`, `Forecast ponderado`, `Propostas abertas`, `Conversão decidida` ou `Próximas ações vencidas` como cards do topo.
- [x] Executar o teste para confirmar a falha no estado atual.
- [x] Remover o `kpiGrid` legado de `src/app/page.tsx`.
- [x] Remover a distribuição de pipeline duplicada da Visão Geral, preservando os tokens CSS usados na página Pipeline.
- [x] Manter o bloco `Indicadores do mês` como primeira seção de indicadores e manter o ID `#rotina` para a rotina comercial.
- [x] Executar o teste da Visão Geral e a suíte CRM completa.

### Task 3: Página Pipeline/Kanban

**Files:**
- Create: `src/app/pipeline/page.tsx`
- Create: `src/components/crm/PipelineKanban.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/crm/pipeline-kanban.test.tsx` somente se o ambiente de testes atual suportar renderização; caso contrário, manter a cobertura pura de `kanban.ts` e validar com build.

**Interfaces:**
- `PipelineKanban` recebe `columns: KanbanColumn[]` e renderiza todas as etapas.
- Cada card deve linkar para `/leads/[id]` e mostrar empresa, contato, valor, probabilidade e próxima ação.

- [x] Construir a página server-side com `requireCurrentAdmin`, `listLeads` e `createSupabaseServerClient`.
- [x] Exibir resumo contextual de oportunidades ativas, pipeline aberto, forecast ponderado e propostas abertas nesta página.
- [x] Renderizar estado vazio quando `leads.length === 0`.
- [x] Criar layout desktop em colunas e mobile com seletor de etapa/coluna única.
- [x] Manter controles de edição sem drag-and-drop e sem mensagens automáticas.
- [x] Executar `npm run build` para validar a nova rota e os tipos.

### Task 4: Sidebar e estados ativos

**Files:**
- Modify: `src/components/crm/CrmSidebar.tsx`
- Modify: `src/components/crm/navigation.ts`
- Modify: `src/components/crm/navigation.test.ts`

- [x] Renderizar `Pipeline` no mesmo menu de todas as rotas autenticadas.
- [x] Usar `activeItem="pipeline"` em `/pipeline`.
- [x] Confirmar via teste que `getCrmNavItemClassName("pipeline", "pipeline")` retorna o estado ativo e que Visão Geral não fica ativo simultaneamente.
- [x] Executar os testes de navegação.

### Task 5: Documentação, cofre e entrega

**Files:**
- Create: `docs/jornada/2026-08-04-registro-overview-kanban.md`
- Modify: `Cofre Comercial Porto Alegre Digital/04 - CRM/Métricas do Funil e Metas.md`
- Create: `Cofre Comercial Porto Alegre Digital/04 - CRM/Registro de Implementação — Overview e Pipeline Kanban.md`
- Modify: `Cofre Comercial Porto Alegre Digital/90 - Governança/Mapa de Entregáveis.md`
- Create: `artifacts/crm-porto-alegre-oficial-hostinger-v12.zip`

- [x] Registrar no cofre a decisão de retirar cards legados e criar a página Kanban.
- [x] Registrar limites factuais: sem métricas de uso real, sem drag-and-drop e sem deploy Hostinger nesta etapa.
- [x] Executar `npm test`, `npm run lint`, `npm run build` e `git diff --check`.
- [x] Gerar pacote sem `.env.local`, commitar apenas os arquivos desta etapa e fazer push na `main`.
