# CRM Porto Alegre Oficial

Primeira versão operacional local do CRM comercial da Porto Alegre Oficial.

## Estado atual

- Leonardo opera o CRM.
- O proprietário acompanha indicadores em modo leitura.
- A aplicação utiliza dados simulados nesta V1.
- O Supabase está preparado, mas não é obrigatório para executar localmente.
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

## Segurança operacional

- Contas críticas do Instagram não são conectadas nesta versão.
- Leads originados no Instagram são registrados manualmente.
- WhatsApp proativo exige opt-in auditável.
- Toda oportunidade deve possuir responsável, próxima ação e data.
- O motivo de perda é obrigatório para negócios perdidos.
