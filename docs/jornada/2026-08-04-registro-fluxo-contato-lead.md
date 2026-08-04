---
title: "Registro factual — fluxo inbound de contato para lead"
date: 2026-08-04
tags:
  - crm
  - whatsapp
  - jornada
  - arquitetura-operacional
  - registro-factual
status: "implementação no código; produção pendente de migration"
---

# Registro factual — fluxo inbound de contato para lead

> [!note] Escopo
> Este registro documenta a implementação técnica do fluxo de qualificação de conversas iniciadas pelo WhatsApp. Não é conteúdo promocional e não apresenta resultados de negócio.

## 1. Contexto

Foi analisada a entrada de pessoas que clicam em anúncios da Meta, chegam à página de vendas e iniciam uma conversa no número comercial conectado por Z-API. O objetivo foi separar o registro operacional de qualquer telefone recebido da decisão posterior de criar uma oportunidade comercial.

O usuário considerado é o operador autenticado do CRM, que responde manualmente, acompanha a conversa e decide o estado comercial. O proprietário permanece como acompanhamento em leitura conforme a governança já registrada.

## 2. Comportamento implementado

- Cada conversa é identificada por `instance_id + phone` e continua sendo persistida pelo webhook.
- A migration `20260804_add_whatsapp_qualification_status.sql` adiciona `qualification_status` com default `new`.
- O estado é exibido como `Novo`, `Qualificando`, `Qualificado`, `Sem interesse`, `Engano` ou `Spam`.
- O webhook não envia o status no upsert; novas mensagens da mesma conversa não resetam o estado.
- A atualização de estado é manual pela rota `PATCH /api/conversas/[phone]/status`.
- A conversão exige estado `qualified`, nome da empresa e segmento.
- A conversão cria um lead com origem `Inbound`, etapa `Contato iniciado` e vincula `lead_id` à conversa.

## 3. Decisão operacional

O termo **contato** representa a pessoa identificada pela conversa, inclusive quando houve engano, spam ou ausência de interesse. O termo **lead** representa somente a oportunidade que o operador marcou como qualificada e decidiu converter.

Essa distinção evita que o volume de mensagens recebidas seja apresentado como volume de oportunidades. Também permite preservar o histórico e o telefone sem obrigar a operação a criar leads para cliques acidentais.

## 4. Evidências e arquivos

- `src/lib/whatsapp/repository.ts`: tipo, leitura e atualização do estado.
- `src/lib/whatsapp/qualification.ts`: validação, rótulos e construção do lead.
- `src/app/api/conversas/[phone]/status/route.ts`: transição autenticada.
- `src/app/api/conversas/[phone]/lead/route.ts`: conversão autenticada.
- `src/app/conversas/WhatsAppInboxPanel.tsx`: controles do operador.
- `supabase/migrations/20260804_add_whatsapp_qualification_status.sql`: alteração de banco.
- `src/lib/whatsapp/repository.test.ts` e `src/lib/whatsapp/qualification.test.ts`: 10 testes focados aprovados.

## 5. Validação

Executado no repositório local:

- `npm test -- src/lib/whatsapp/repository.test.ts src/lib/whatsapp/qualification.test.ts` — aprovado.
- `npm run lint` — aprovado sem avisos.
- `npm run build` — aprovado, com as rotas de status e conversão listadas no build.

Commits locais da implementação: `feab64f` e `8c23841`.

## 6. Limites factuais

### Comprovado

- O código local contém a migration, as regras, as rotas e os controles de interface.
- Os testes focados, lint e build foram executados com sucesso.
- O status não é enviado no upsert de cada mensagem.

### Ainda não comprovado

- A migration ainda não foi aplicada ao projeto Supabase de produção.
- Não foi realizada nesta etapa uma validação com mensagem real no domínio publicado.
- Não há resultado observado de conversão, taxa de qualificação ou ganho de produtividade.

## 7. Segurança para publicação

| Informação | Classificação | Orientação |
|---|---|---|
| Separação entre contato e lead | publicável | Pode ser explicada em termos gerais. |
| Estados e regra de conversão | publicável com anonimização | Remover nomes, telefones, campanhas e URLs internas. |
| Caminhos locais, rotas internas e nomes de arquivos | interna | Não incluir em screenshots públicos. |
| Nomes, telefones, IDs, mensagens e dados de leads | sensível | Mascarar ou não publicar. |
| Credenciais, tokens, cookies e variáveis de ambiente | sensível | Nunca incluir. |
| Resultados de conversão, metas e valores | sensível | Não apresentar como resultado sem evidência e autorização. |

## 8. Síntese editorial factual

- **Problema:** mensagens recebidas pelo WhatsApp não devem ser tratadas automaticamente como oportunidades comerciais.
- **Decisão:** registrar toda conversa como contato em `Novo`, qualificar manualmente e converter em lead somente após `Qualificado`.
- **Aprendizado:** separar identidade e histórico da conversa da decisão comercial torna o funil mais auditável.

### Perguntas editoriais possíveis

1. Como diferenciar volume de contatos recebidos de oportunidades realmente qualificadas?
2. Quais decisões devem continuar manuais quando uma conversa chega por tráfego pago?
3. Como preservar o histórico de um contato sem inflar o pipeline de vendas?
