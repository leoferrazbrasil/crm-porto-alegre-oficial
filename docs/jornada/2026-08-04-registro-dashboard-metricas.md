---
title: "Registro factual — métricas do dashboard e meta mensal"
date: 2026-08-04
tags:
  - crm
  - jornada
  - metricas
  - metas
  - registro-factual
status: "implementação local validada; publicação do Supabase pendente"
---

# Registro factual — métricas do dashboard e meta mensal

> [!note] Natureza do registro
> Este documento registra o que foi especificado e implementado localmente nesta etapa. Não é material promocional e não apresenta resultado comercial observado.

## 1. Contexto

Foi analisado e ampliado o bloco de indicadores da visão geral autenticada do CRM da Porto Alegre Oficial. O objetivo foi transformar a modelagem do funil inbound em indicadores operacionais para a rotina mensal, com uma meta de faturamento editável.

O perfil considerado é o administrador que acompanha conversas, negociações, vendas e metas. A operação continua dependente de dados persistidos no Supabase e do histórico de eventos do CRM.

## 2. Comportamento implementado

- `Conversas iniciadas` conta conversas inbound únicas criadas na coorte do mês.
- `Negociações realizadas` conta leads vinculados à coorte que alcançaram a etapa `Negociação`.
- `Vendas fechadas` conta leads vinculados à coorte que alcançaram `Fechado ganho`.
- `Faturamento gerado no período` soma `estimated_value` das vendas fechadas observadas.
- `Ticket médio` divide o faturamento gerado pela quantidade de vendas fechadas.
- As taxas exibidas são Conversa → Negociação, Negociação → Venda e Conversa → Venda.
- A meta mensal é lida e gravada por `month_start` na tabela `crm_monthly_targets`.
- A alteração da meta dispara novo cálculo de vendas, contatos/conversas e negociações necessárias por dia.
- Sem ticket ou taxa suficientes, a interface exibe `—`.

## 3. Fórmulas adotadas

```text
ticket médio = faturamento gerado / vendas fechadas
taxa conversa → negociação = negociações / conversas iniciadas
taxa negociação → venda = vendas fechadas / negociações
taxa conversa → venda = vendas fechadas / conversas iniciadas
vendas necessárias = teto(meta mensal / ticket médio)
conversas necessárias = teto(vendas necessárias / taxa conversa → venda)
negociações necessárias = teto(vendas necessárias / taxa negociação → venda)
volume diário = teto(volume necessário / dias corridos do mês)
```

As taxas são calculadas em percentual. Quando o denominador é zero, o valor não é convertido para 0%; permanece não calculável.

## 4. Arquivos e componentes

- `src/lib/crm/funnel-metrics.ts`: cálculo de contagens, receita, ticket e taxas.
- `src/lib/crm/target-pacing.ts`: cálculo de volumes necessários para a meta.
- `src/lib/crm/funnel-metrics-repository.ts`: leitura de leads com valor estimado.
- `src/lib/crm/targets-repository.ts`: leitura, validação e gravação da meta mensal.
- `src/app/api/metas/faturamento/route.ts`: endpoint autenticado para salvar a meta.
- `src/app/MonthlyRevenueTargetForm.tsx`: campo editável e estado de salvamento.
- `src/app/page.tsx` e `src/app/globals.css`: apresentação responsiva dos indicadores.
- `supabase/migrations/20260804_add_crm_monthly_targets.sql`: tabela, trigger, índice e RLS.

## 5. Evidências de validação

Foram executados localmente:

- `npm test`: 27 arquivos, 112 testes aprovados.
- `npm run lint`: saída sem erros.
- `npm run build`: compilação Next.js concluída; rota `/api/metas/faturamento` incluída.

Os testes cobrem soma de receita apenas para ganhos, ticket médio, taxas nomeadas, projeção diária e validação de valor/competência.

## 6. Limites factuais

### Comprovado

- O código local calcula e exibe as métricas solicitadas.
- A edição da meta usa uma rota autenticada e uma tabela mensal dedicada.
- A compilação local inclui a nova rota e os testes passam.

### Inferido

- A separação entre conversa, negociação e venda tende a reduzir ambiguidade na leitura do funil.
- A meta persistida por competência permite manter o histórico de metas mensais.

### Ainda pendente

- Aplicar as migrations no projeto Supabase de produção.
- Revalidar o dashboard publicado com dados reais.
- Validar se dias corridos ou dias úteis são a convenção preferida da rotina.
- Validar com uso real se a nomenclatura “contatos” deve permanecer como sinônimo operacional de conversas inbound.

## 7. Segurança para publicação

| Informação | Classificação |
|---|---|
| Fórmulas genéricas e organização do funil | publicável |
| Nomes de componentes e migrations | interna |
| Metas, ticket, faturamento e dados de leads | sensível |
| URLs de Supabase, Hostinger ou CRM | interna/sensível |
| Credenciais, tokens, cookies e dados pessoais | sensível |

Nenhuma credencial ou dado pessoal foi incluído neste registro.

## 8. Síntese editorial factual

- **Problema:** o dashboard precisava reunir volume, valor, conversão e ritmo de meta sem misturar as etapas do funil.
- **Decisão:** foi adotado um bloco de indicadores baseado em eventos, valor de vendas ganhas e meta mensal persistida.
- **Aprendizado:** uma projeção de meta só é calculável quando ticket e taxas possuem base observada; caso contrário, a interface deve indicar ausência de base.

