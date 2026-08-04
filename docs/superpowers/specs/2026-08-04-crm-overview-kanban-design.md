# Visão Geral executiva e Pipeline Kanban

**Data:** 2026-08-04  
**Status:** aprovado para implementação

## Objetivo

Reorganizar a Visão Geral do CRM para exibir apenas indicadores mensais definidos e criar uma página exclusiva de Pipeline no formato Kanban para a operação das oportunidades.

## Diagnóstico atual

O topo da Visão Geral renderiza seis cards a partir de `calculateCrmSummary()`:

- Oportunidades ativas;
- Pipeline aberto;
- Forecast ponderado;
- Propostas abertas;
- Conversão decidida;
- Próximas ações vencidas.

Esses valores vêm do snapshot atual de leads e não usam a mesma coorte mensal nem o ledger `crm_funnel_events` das métricas de aquisição, conversão e meta. A página também renderiza uma distribuição de pipeline em grade, mas ainda não existe uma rota exclusiva de Kanban no sidebar.

## Decisão

### Visão Geral

O `kpiGrid` legado será removido. A primeira seção após o cabeçalho será `Aquisição, Conversão e Meta`, que permanecerá como fonte única para:

- Conversas iniciadas;
- Negociações realizadas;
- Vendas fechadas;
- Ticket médio;
- Meta mensal;
- Faturamento gerado;
- Taxas Conversa → Negociação, Negociação → Venda e Conversa → Venda;
- Ritmo diário necessário para a meta.

O bloco de rotina permanecerá separado dos indicadores de resultado. Não haverá duplicação dos cards legados na Visão Geral.

### Reclassificação dos cards legados

| Indicador legado | Destino |
|---|---|
| Oportunidades ativas | Resumo da página Pipeline/Kanban |
| Pipeline aberto | Resumo da página Pipeline/Kanban |
| Forecast ponderado | Resumo da página Pipeline/Kanban |
| Propostas abertas | Resumo da página Pipeline/Kanban |
| Conversão decidida | Removido; substituído pelas taxas oficiais do funil |
| Próximas ações vencidas | Rotina comercial como alerta operacional |

### Pipeline Kanban

Será criada a rota `/pipeline` e um item principal `Pipeline` no sidebar. A página exibirá todas as etapas de `PIPELINE_STAGES` em ordem, incluindo ganhos e perdas:

1. Mapeado
2. Contato iniciado
3. Engajado
4. Qualificado
5. Diagnóstico
6. Solução apresentada
7. Proposta enviada
8. Negociação
9. Fechado ganho
10. Fechado perdido

Cada coluna exibirá quantidade de leads e valor total. Cada card exibirá empresa, contato, valor, probabilidade e próxima ação, com link para o detalhe do lead.

## Interação e responsividade

- Desktop: colunas lado a lado, com rolagem horizontal somente dentro do quadro quando necessário.
- Mobile: seletor de etapa e uma coluna por vez, evitando uma faixa horizontal impossível de operar.
- A primeira versão moverá a etapa por controle explícito no card ou no detalhe do lead; não dependerá exclusivamente de arrastar e soltar.
- Toda mudança de etapa continuará passando pelo fluxo existente de atualização do lead, para que o trigger do Supabase registre `lead_stage_changed`.
- O estado ativo do sidebar será `Pipeline` em `/pipeline` e subrotas futuras.

## Dados e limites

- A página usará leads persistidos no Supabase.
- Quando não houver leads, exibirá estado vazio operacional; não deve inventar oportunidades para a operação real.
- Os quatro indicadores legados de volume/valor serão calculados no contexto do snapshot da página Pipeline, não reapresentados como métricas de conversão mensal.
- As taxas mensais continuam sendo responsabilidade da Visão Geral e do ledger de eventos.

## Critérios de aceitação

- O topo da Visão Geral não exibe mais os seis cards legados.
- A seção de aquisição/conversão/meta é a primeira seção de indicadores da página.
- O sidebar contém `Pipeline` apontando para `/pipeline`.
- `/pipeline` renderiza as dez etapas oficiais, mesmo quando alguma não possui leads.
- Cada lead aparece uma única vez na coluna correspondente.
- A página exibe valores, probabilidades e próxima ação sem perder o link para edição.
- O layout não cria rolagem horizontal no viewport mobile.
- `npm test`, `npm run lint` e `npm run build` continuam passando.

## Fora de escopo nesta etapa

- Drag-and-drop avançado com biblioteca externa;
- filtros persistidos por usuário;
- alteração da taxonomia oficial de etapas;
- alteração das fórmulas das métricas mensais;
- automações, campanhas ou disparos de mensagens.
