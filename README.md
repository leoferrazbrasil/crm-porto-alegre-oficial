# CRM Porto Alegre Oficial

Primeira versão operacional local do CRM comercial da Porto Alegre Oficial.

## Estado atual

- Leonardo e o proprietário possuem acesso administrativo integral ao CRM.
- A aplicação usa Supabase para autenticação, perfil e CRUD de leads.
- O dashboard usa leads reais quando existirem e dados simulados como fallback visual.
- Existe integração V1 com Z-API apenas para status da instância e conexão por QR Code.
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
```

Não armazene chaves `sb_secret_` ou `service_role` no frontend ou no Git.

## Configuração opcional da Z-API

Para conectar um número de WhatsApp via QR Code em `/integracoes/whatsapp`,
preencha as variáveis server-side:

```env
ZAPI_INSTANCE_ID=
ZAPI_INSTANCE_TOKEN=
ZAPI_CLIENT_TOKEN=
```

Essas variáveis não podem usar prefixo `NEXT_PUBLIC_` e nunca devem ser
expostas no navegador.

## Segurança operacional

- Contas críticas do Instagram não são conectadas nesta versão.
- Leads originados no Instagram são registrados manualmente.
- WhatsApp proativo exige opt-in auditável e aprovação separada.
- A integração Z-API V1 não envia mensagens, não dispara campanhas e não lê conversas.
- Toda oportunidade deve possuir responsável, próxima ação e data.
- O motivo de perda é obrigatório para negócios perdidos.
