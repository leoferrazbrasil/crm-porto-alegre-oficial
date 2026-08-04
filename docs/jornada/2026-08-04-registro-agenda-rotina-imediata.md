---
title: "Registro factual — Agenda da rotina imediata"
date: 2026-08-04
tags:
  - crm
  - agenda
  - rotina-comercial
  - jornada
status: "implementado localmente; publicação do Supabase pendente"
---

# Registro factual — Agenda da rotina imediata

## Contexto

Foi solicitada a configuração da agenda da **Visão Geral** para que a rotina imediata reúna as ações comerciais registradas com data e hora no CRM, especialmente respostas a leads e envio de propostas.

## Decisão aplicada

A agenda é derivada de `next_action` e `next_action_at` dos leads que a Visão Geral já carrega do Supabase, com fallback local existente. Cada registro válido aparece uma vez, ordenado pela data/hora mais próxima. Ações vencidas permanecem visíveis e recebem a indicação **Vencida**.

A prioridade visual é calculada pela proximidade da data: alta para ações vencidas ou nas próximas 24 horas, média entre 24 e 72 horas e baixa depois disso. A prioridade não altera o estágio do funil.

## Alterações técnicas

- `src/lib/crm/immediate-routine.ts`: helper puro de filtragem, ordenação, status e prioridade.
- `src/lib/crm/immediate-routine.test.ts`: testes de inclusão, ordenação, prioridade e descarte de registros inválidos.
- `src/app/page.tsx`: Visão Geral passa a renderizar a agenda a partir dos leads, com empresa, etapa, data/hora e link para o cadastro.
- `src/app/globals.css`: estilos para estados vencido, link, metadados e estado vazio.
- `src/app/page-structure.test.ts`: verificação estrutural da nova fonte da agenda.

## Limites factuais

- Não foi criada uma tabela de tarefas separada.
- Não foram implementados lembretes, notificações, conclusão de tarefas ou calendários externos.
- A publicação na Hostinger e a aplicação das migrations no Supabase continuam sendo etapas de infraestrutura separadas.
- O uso real da agenda ainda precisa ser validado na rotina comercial.

## Segurança para publicação

- Publicável: decisão geral de UX e regra de derivação da agenda.
- Interno: detalhes da operação comercial, rotas autenticadas e campos do Supabase.
- Sensível: nenhuma credencial foi incluída; dados reais de leads não devem aparecer em screenshots públicos.

