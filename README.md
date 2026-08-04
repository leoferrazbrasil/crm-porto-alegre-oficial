# CRM Porto Alegre Oficial

Versão operacional do CRM comercial da Porto Alegre Oficial.

## Estado atual

- Leonardo e o proprietário possuem acesso administrativo integral ao CRM.
- A aplicação usa Supabase para autenticação, perfil e CRUD de leads.
- O dashboard usa leads reais quando existirem e dados simulados como fallback visual.
- Existe integração com Z-API para status, conexão por QR Code e recebimento de
  mensagens de texto por webhook.
- A página `/conversas` exibe a lista de chats, a linha do tempo persistida e
  permite resposta manual individual em texto.
- Não existe integração direta com Instagram, automação de mensagens ou publicação.

## Executar localmente

Requisitos:

- Node.js 22 ou superior.
- npm 10 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Validação

```bash
npm test
npm run build
```

## Estrutura

- `src/app`: interface operacional.
- `src/lib/crm`: domínio, métricas, pipeline, campos e dados simulados.
- `src/lib/supabase`: cliente público opcional.
- `supabase/schema.sql`: schema inicial, papéis e políticas de acesso.
- `.env.example`: contrato das variáveis públicas.

## Configuração opcional do Supabase

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Não armazene chaves `sb_secret_` ou `service_role` no frontend ou no Git.

## Configuração opcional da Z-API

Para conectar um número de WhatsApp via QR Code em `/integracoes/whatsapp`,
preencha as variáveis server-side:

```env
ZAPI_INSTANCE_ID=
ZAPI_INSTANCE_TOKEN=
ZAPI_CLIENT_TOKEN=
ZAPI_WEBHOOK_SECRET=
```

Essas variáveis não podem usar prefixo `NEXT_PUBLIC_` e nunca devem ser
expostas no navegador.

## Caixa de entrada do WhatsApp

`/conversas` consulta `GET /api/zapi/chats` no servidor e apresenta nome,
telefone, última interação e contagem de não lidas. Um chat individual pode
ser selecionado para visualizar mensagens persistidas e enviar uma resposta
manual em texto de até 4.000 caracteres.

A resposta de chats é uma lista resumida da Z-API. A linha do tempo passa a ser
persistida a partir da ativação dos webhooks; o histórico anterior não é
importado retroativamente.

Configure no provedor Z-API, usando HTTPS, as URLs:

```text
https://crm.seu-dominio.com/api/webhooks/zapi/received/SEU_SEGREDO
https://crm.seu-dominio.com/api/webhooks/zapi/delivery/SEU_SEGREDO
```

Substitua o host pelo ambiente publicado e utilize o mesmo valor aleatório em
`ZAPI_WEBHOOK_SECRET`. O segredo não deve aparecer no navegador, em screenshots
ou no repositório.

Para atribuição de campanhas, a landing page pode acrescentar ao texto
pré-preenchido do WhatsApp um rodapé controlado, sem dados pessoais:

```text
---
Origem: facebook
Campanha: nome-da-campanha
GCLID: identificador-opcional
```

O CRM remove esse rodapé da mensagem exibida e salva somente os campos
normalizados na conversa. Se o usuário remover ou editar o rodapé, a origem
específica permanece não identificada.

## Segurança operacional

- Contas críticas do Instagram não são conectadas nesta versão.
- Leads originados no Instagram são registrados manualmente.
- WhatsApp proativo exige opt-in auditável e aprovação separada.
- A integração Z-API não dispara campanhas nem automações; o envio permitido é
  individual, manual e somente em texto para o chat selecionado.
- Toda oportunidade deve possuir responsável, próxima ação e data.
- O motivo de perda é obrigatório para negócios perdidos.
