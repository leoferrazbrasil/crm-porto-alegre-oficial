# Preparação do Supabase

O CRM utiliza Supabase para autenticação, perfis, leads e persistência das
conversas WhatsApp. Estes arquivos documentam o contrato do banco sem incluir
credenciais reais no repositório.

## Configuração local

1. Copie `.env.example` para `.env.local`.
2. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Configure `SUPABASE_SERVICE_ROLE_KEY` apenas no ambiente server-side que
   recebe os webhooks. Nunca adicione essa chave ao frontend ou ao Git.
4. Execute `supabase/schema.sql` no SQL Editor do projeto Supabase.
5. Execute `supabase/migrations/20260730_add_whatsapp_conversations.sql` no
   mesmo SQL Editor para criar as tabelas de conversas e mensagens.

Sem essas variáveis, `getSupabaseBrowserClient()` retorna `null` e a aplicação permanece em modo local.

## Perfis de acesso

- `admin`: Leonardo e proprietário, com acesso integral à operação comercial.
- `operator`: papel legado compatível com as permissões administrativas.
- `viewer`: acesso de leitura reservado para futuros acompanhantes.

O primeiro perfil administrador deve ser criado após o convite do usuário no Supabase Auth. Chaves `sb_secret_` ou `service_role` devem permanecer restritas ao ambiente seguro do Supabase.

## Webhooks e conversas

As rotas `/api/webhooks/zapi/received/[secret]` e
`/api/webhooks/zapi/delivery/[secret]` usam o segredo configurado em
`ZAPI_WEBHOOK_SECRET`, conferem o `instanceId` server-side e persistem somente
o subconjunto normalizado necessário para a operação. A restrição única por
instância e `provider_message_id` torna reentregas idempotentes.

## Limites da V1

- Não existe integração direta com Instagram.
- Leads originados no Instagram são cadastrados manualmente.
- Não existe automação de mensagens, publicação ou engajamento.
- O primeiro contato inbound é capturado como conversa; um lead não é criado
  artificialmente sem empresa, responsável e próxima ação. A vinculação a um
  lead qualificado permanece uma decisão operacional posterior.
