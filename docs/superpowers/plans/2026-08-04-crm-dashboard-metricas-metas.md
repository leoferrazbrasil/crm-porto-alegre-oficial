# Métricas do Dashboard e Meta Mensal — Plano de Implementação

> **Para trabalhadores agentic:** implementar tarefa a tarefa, mantendo o ciclo TDD e executando os testes indicados antes de avançar.

**Objetivo:** exibir no dashboard as métricas do funil e o ritmo necessário para atingir uma meta mensal de faturamento editável.

**Arquitetura:** o ledger `crm_funnel_events` continua sendo a fonte de passagem de etapas. A receita é calculada sobre leads que atingiram `Fechado ganho`, usando `estimated_value`. A meta mensal fica em `crm_monthly_targets`, identificada por `month_start`; o dashboard lê e grava essa competência e deriva ticket, taxas e volumes diários.

**Stack:** Next.js 16, React 19, TypeScript, Supabase, Vitest, Obsidian Flavored Markdown.

## Restrições globais

- Não misturar conversa iniciada, negociação e venda fechada.
- Não contar a mesma conversa ou lead mais de uma vez.
- Taxas sem denominador e projeções sem ticket/taxa observados devem aparecer como `—`.
- A meta editável é mensal, em BRL, sem credenciais ou valores sensíveis no código.
- A migration de produção do Supabase deve ser aplicada antes de considerar a persistência disponível.

### Tarefa 1: Especificar os cálculos

**Arquivos:**
- Modificar: `src/lib/crm/funnel-metrics.test.ts`
- Criar: `src/lib/crm/target-pacing.test.ts`

- [x] Escrever testes falhando para receita, ticket, taxas nomeadas e ritmo diário.
- [x] Executar `npm test src/lib/crm/funnel-metrics.test.ts src/lib/crm/target-pacing.test.ts` e confirmar falha por propriedades ausentes.

### Tarefa 2: Implementar métricas e projeção

**Arquivos:**
- Modificar: `src/lib/crm/funnel-metrics.ts`
- Criar: `src/lib/crm/target-pacing.ts`
- Modificar: `src/lib/crm/funnel-metrics-repository.ts`

**Interfaces:**
- `FunnelLeadSnapshot.estimatedValue?: number`.
- `FunnelMetrics` expõe `salesClosed`, `revenueGenerated`, `averageTicket` e taxas `conversationToNegotiation`, `negotiationToSale`, `conversationToSale`, preservando os campos legados.
- `calculateTargetPacing(metrics, targetRevenue, period)` retorna vendas, conversas e negociações necessárias e seus volumes por dia.

- [x] Implementar somente o mínimo necessário para os testes da Tarefa 1.
- [x] Executar os mesmos testes e confirmar aprovação.

### Tarefa 3: Persistir a meta mensal

**Arquivos:**
- Criar: `supabase/migrations/20260804_add_crm_monthly_targets.sql`
- Criar: `src/lib/crm/targets-repository.ts`
- Criar: `src/app/api/metas/faturamento/route.ts`
- Criar: `src/lib/crm/targets-repository.test.ts`

- [x] Criar tabela `crm_monthly_targets` com `month_start` como chave, valor não negativo, `updated_at`, RLS de leitura para autenticados e escrita para `admin`/`operator`.
- [x] Testar validação de mês e valor.
- [x] Implementar leitura com fallback zero e upsert autenticado via rota `PUT` protegida por `requireCurrentAdmin`.

### Tarefa 4: Atualizar o dashboard

**Arquivos:**
- Criar: `src/app/MonthlyRevenueTargetForm.tsx`
- Modificar: `src/app/page.tsx`
- Modificar: `src/app/globals.css`
- Modificar: `src/lib/crm/dashboard.test.ts`

- [x] Ler a meta da competência atual no server component.
- [x] Renderizar cards para as seis métricas financeiras/volumétricas, três taxas solicitadas e dois ritmos diários.
- [x] Permitir edição explícita da meta e recarregar o dashboard após salvamento bem-sucedido.
- [x] Manter responsividade para desktop e mobile e estados de erro/salvamento.

### Tarefa 5: Documentação e entrega

**Arquivos:**
- Modificar: `Cofre Comercial Porto Alegre Digital/04 - CRM/Métricas do Funil e Metas.md`
- Criar: `docs/jornada/2026-08-04-registro-dashboard-metricas.md`
- Criar: `artifacts/crm-porto-alegre-oficial-hostinger-v11.zip`

- [x] Registrar fórmulas, limites factuais, migration pendente e commits.
- [x] Executar `npm test`, `npm run lint`, `npm run build` e `git diff --check`.
- [x] Empacotar arquivos de hospedagem, commitar mudanças intencionais e fazer push na `main`.
