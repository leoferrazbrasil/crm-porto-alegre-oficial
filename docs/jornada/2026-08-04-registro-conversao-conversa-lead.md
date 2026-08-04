---
title: "Registro factual — Conversão contextual de conversa em lead"
date: 2026-08-04
tags:
  - crm
  - whatsapp
  - lead
  - jornada
status: implementado localmente; publicação pendente
---

# Registro factual — Conversão contextual de conversa em lead

## Decisão

O operador converte uma conversa em lead sem sair da caixa de entrada. A ação aparece quando a conversa está em `Negociação` e ainda não possui lead vinculado.

Ao clicar em **Transformar em lead**, abre-se um painel lateral no desktop ou um diálogo em tela cheia no mobile. O painel mantém os dados herdados da conversa em leitura e solicita somente:

- empresa;
- segmento;
- próxima ação;
- data e hora da próxima ação.

Nome, telefone, canal, campanha e etapa são reaproveitados. O lead é criado em `Negociação` e vinculado à conversa.

## Comportamento aplicado

- `Novo` e `Qualificando`: mostram que a conversão fica disponível em `Negociação`.
- `Negociação` sem lead: mostra **Transformar em lead**.
- Lead vinculado: mostra **Abrir lead**.
- Cancelamento, Escape ou clique fora do painel não criam lead.
- O envio bloqueia duplo clique, exibe estado de processamento e mantém o operador na conversa após o sucesso.
- Novas mensagens continuam sem reiniciar a etapa da conversa.

## Arquivos envolvidos

- `src/app/conversas/WhatsAppInboxPanel.tsx`
- `src/app/conversas/conversation-conversion.ts`
- `src/app/conversas/conversation-conversion.test.ts`
- `src/lib/whatsapp/qualification.ts`
- `src/app/api/conversas/[phone]/lead/route.ts`
- `src/app/globals.css`

## Validação

- 30 arquivos de teste e 118 testes aprovados.
- Lint aprovado.
- Build aprovado.
- O endpoint de criação e vínculo permanece protegido por sessão administrativa.

## Limites factuais

- A migration do funil precisa estar aplicada no Supabase de produção para os estados atuais coincidirem com o código.
- Não há resultado de uso real, tempo de atendimento ou melhoria de conversão medidos nesta entrega.
- Deduplicação global por telefone continua fora de escopo.
