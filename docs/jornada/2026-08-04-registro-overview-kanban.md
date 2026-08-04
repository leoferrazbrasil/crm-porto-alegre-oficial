---
title: "Registro factual — Visão Geral e Pipeline Kanban"
date: 2026-08-04
tags:
  - crm
  - jornada
  - dashboard
  - kanban
  - arquitetura-operacional
status: "implementado localmente; publicação pendente"
---

# Registro factual — Visão Geral e Pipeline Kanban

> [!note] Natureza do registro
> Este documento registra uma alteração de arquitetura de interface e operação. Não apresenta resultado de uso real, produtividade ou conversão.

## 1. Contexto

Foi analisada a Visão Geral autenticada do CRM e a relação entre os cards legados do topo, as métricas mensais de aquisição/conversão/meta e a distribuição atual do pipeline.

O objetivo foi evitar que indicadores de snapshot, métricas de coorte e tarefas operacionais ocupassem o mesmo nível de decisão. Também foi criada uma superfície exclusiva para a operação das oportunidades em Kanban.

## 2. Comportamento anterior

- A Visão Geral exibía seis cards calculados por `calculateCrmSummary()`:
  `Oportunidades ativas`, `Pipeline aberto`, `Forecast ponderado`, `Propostas abertas`, `Conversão decidida` e `Próximas ações vencidas`.
- Esses cards usavam o snapshot de leads, não o mesmo ledger/coorte das métricas mensais.
- A página também exibia uma grade de distribuição por etapa, mas não possuía uma rota exclusiva `/pipeline`.
- O sidebar tinha cinco módulos principais e não continha `Pipeline`.

## 3. Decisão implementada

- O grid legado foi removido da Visão Geral.
- A seção de aquisição, conversão e meta passou a ser a primeira seção de indicadores.
- A distribuição de pipeline foi removida da Visão Geral para não duplicar a nova página operacional.
- O sidebar recebeu `Pipeline` apontando para `/pipeline`.
- A nova página `Pipeline Kanban` reaproveita os quatro indicadores de snapshot no contexto correto: oportunidades ativas, pipeline aberto, forecast ponderado e propostas abertas.
- As dez etapas oficiais são exibidas, inclusive quando uma coluna está vazia.

## 4. Kanban implementado

- Desktop: colunas lado a lado em um quadro próprio.
- Mobile: seletor de etapa e uma coluna exibida por vez.
- Cards: empresa, contato, origem, valor, probabilidade, próxima ação e link para abrir a oportunidade.
- Não foi adicionado drag-and-drop nesta etapa.
- A alteração de etapa continua sendo feita pelo fluxo de edição de lead existente, preservando o registro de evento do Supabase.
- A página utiliza leads persistidos; sem leads, exibe estado vazio em vez de preencher oportunidades fictícias.

## 5. Arquivos principais

- `src/app/page.tsx`: Visão Geral sem o grid legado e sem a grade de pipeline duplicada.
- `src/app/pipeline/page.tsx`: rota autenticada do Pipeline.
- `src/components/crm/PipelineKanban.tsx`: interface Kanban responsiva.
- `src/lib/crm/kanban.ts`: agrupamento das dez etapas sem duplicidade.
- `src/components/crm/navigation.ts`: item `Pipeline` no sidebar.
- `src/app/globals.css`: resumo, quadro, cards e comportamento mobile.

## 6. Evidências

Validação local realizada:

- `npm test`: 29 arquivos, 115 testes aprovados.
- `npm run lint`: saída sem erros.
- `npm run build`: rota `/pipeline` incluída na compilação.

Testes adicionados cobrem a presença do item de navegação, o estado ativo, as dez colunas Kanban, colunas vazias, soma de valores e remoção dos cards legados da Visão Geral.

## 7. Limites factuais

### Comprovado

- A rota `/pipeline` existe no código local e passa pela autenticação existente.
- O quadro preserva a ordem oficial de etapas e não duplica leads.
- A Visão Geral não renderiza mais os seis cards legados.

### Ainda não comprovado

- Não houve teste de usabilidade com Leonardo ou proprietário.
- Não foi medido ganho de produtividade ou redução de tempo de tarefa.
- Não foi validada a experiência visual em dispositivo físico.
- O deploy da alteração ainda depende de novo pacote e publicação autorizada.

## 8. Segurança para publicação

| Informação | Classificação |
|---|---|
| Arquitetura geral da Visão Geral e Kanban | publicável com anonimização |
| Nomes de etapas do funil | interna |
| Valores, leads, probabilidades e nomes de contatos | sensível |
| URLs internas, Supabase, Hostinger e rotas autenticadas | interna/sensível |
| Credenciais e tokens | sensível |

## 9. Síntese editorial factual

- **Problema:** a Visão Geral misturava indicadores de snapshot, métricas mensais e alertas operacionais no mesmo conjunto de cards.
- **Decisão:** os indicadores mensais permaneceram na Visão Geral e o snapshot de oportunidades foi transferido para uma página Pipeline Kanban.
- **Aprendizado:** a organização da interface precisa acompanhar a separação operacional entre medir, decidir e executar.
