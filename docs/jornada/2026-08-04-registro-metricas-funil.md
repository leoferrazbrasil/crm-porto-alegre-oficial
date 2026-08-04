---
title: "Registro factual — métricas do funil inbound"
date: 2026-08-04
tags:
  - crm
  - metricas
  - funil
  - metas
  - registro-factual
status: "implementação no código; produção pendente de migration"
---

# Registro factual — métricas do funil inbound

> [!note] Escopo
> Este registro documenta a definição e a implementação local das métricas do fluxo Meta → landing page → WhatsApp → CRM. Não apresenta metas numéricas, taxas históricas ou resultados de negócio.

## Decisão de modelagem

O funil conta entidades únicas, não mensagens:

`Conversas iniciadas → Contatos válidos → Qualificando → Qualificados → Leads → Negociações → Fechados ganhos/perdidos`

`Engano` e `Spam` ficam fora de contatos válidos. `Sem interesse` é contato real, mas não oportunidade qualificada.

## Implementação local

- Criada a tabela `crm_funnel_events` com histórico de transições.
- Triggers registram criação e mudança de estado de conversas, vínculo de lead, criação de leads e mudança de etapa.
- O cálculo usa coorte pela data de criação da conversa.
- O dashboard exibe contagens do funil, taxas de conversão, conversas aguardando primeira resposta e mediana de resposta.
- Taxas com denominador zero são exibidas como não calculáveis.

## Arquivos envolvidos

- `supabase/migrations/20260804_add_crm_funnel_events.sql`
- `src/lib/crm/funnel-events.ts`
- `src/lib/crm/funnel-metrics.ts`
- `src/lib/crm/funnel-metrics-repository.ts`
- `src/app/page.tsx`
- `src/app/globals.css`

## Evidências de validação

- Testes focados do cálculo e do dashboard aprovados.
- Suíte completa, lint e build executados durante a etapa.
- A rota inicial do CRM foi compilada com a nova seção de funil.

## Limites factuais

- A migration ainda não foi aplicada ao Supabase de produção.
- Não há números reais de conversão registrados nesta documentação.
- O dashboard não deve ser interpretado como evidência de aumento de vendas ou produtividade.
- Metas e projeções só devem utilizar taxas observadas após o início da coleta consistente de eventos.

## Segurança para publicação

| Informação | Classificação |
|---|---|
| Vocabulário e fórmulas gerais do funil | publicável |
| Arquitetura de eventos e rotas internas | interna |
| Nomes, telefones, mensagens e IDs | sensível |
| Metas, valores, taxas e forecast do negócio | sensível |
| Credenciais, tokens, cookies e variáveis de ambiente | sensível |

## Síntese factual

- **Problema:** sem histórico de transições, o CRM não consegue explicar como as conversas avançam até negociação e fechamento.
- **Decisão:** registrar eventos de jornada e exibir o funil separado do resumo atual de leads.
- **Aprendizado:** métricas úteis para projeção dependem de definições estáveis, coortes e denominadores explícitos.
