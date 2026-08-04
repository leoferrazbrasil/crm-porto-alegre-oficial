---
title: "Registro factual — Funil de Vendas e estados da jornada"
date: 2026-08-04
tags:
  - crm
  - funil-de-vendas
  - whatsapp
  - jornada
status: implementado localmente; migration pendente de aplicação
---

# Registro factual — Funil de Vendas e estados da jornada

## Contexto

Foi solicitada a substituição da página **Pipeline** por **Funil de Vendas**, com rota canônica `/funil`, além da troca das etapas antigas do Kanban e dos estados da jornada do contato.

## Decisão aplicada

O quadro passou a utilizar seis etapas, nesta ordem:

`Novo → Qualificando → Negociação → Proposta → Ganho → Perdido`

O contato começa em `Novo`. A etapa é alterada manualmente após a tratativa. A rotina de recebimento de mensagens mantém a etapa persistida e não a reinicia quando uma nova mensagem chega.

Os estados anteriores `Qualificado`, `Sem interesse`, `Engano` e `Spam` deixaram de ser opções da interface. A conversão explícita para lead fica disponível em `Negociação`, e o lead criado entra nessa mesma etapa.

## Alterações técnicas

- `src/lib/crm/pipeline.ts`: seis etapas oficiais, com `Ganho` e `Perdido` como estados encerrados.
- `src/app/funil/page.tsx`: nova rota e título **Funil de Vendas**.
- `src/app/pipeline/page.tsx`: redirecionamento de compatibilidade para `/funil`.
- `src/components/crm/navigation.ts`: item **Funil de Vendas** apontando para `/funil`.
- `src/lib/whatsapp/repository.ts` e `src/lib/whatsapp/qualification.ts`: estados da jornada atualizados.
- `src/app/conversas/WhatsAppInboxPanel.tsx`: ações e conversão alinhadas ao novo vocabulário.
- `supabase/migrations/20260804_update_crm_funnel_stages.sql`: normalização de registros existentes, restrições novas e atualização dos eventos históricos.

## Validação

- 29 arquivos de teste e 115 testes aprovados localmente.
- O lint e o build devem ser executados novamente antes da entrega do pacote.

## Limites factuais

- A migration foi criada, mas sua aplicação no Supabase de produção ainda depende da execução no ambiente.
- Não há medição de uso real, conversão ou impacto comercial nesta alteração.
- O Kanban continua sem arrastar e soltar; a etapa é alterada pelo fluxo de edição existente.

## Segurança para publicação

- Publicável: nomes das etapas, rota e descrição técnica geral.
- Interno: regras de conversão e detalhes do fluxo operacional.
- Sensível: nenhuma credencial ou dado pessoal foi incluído neste registro.
