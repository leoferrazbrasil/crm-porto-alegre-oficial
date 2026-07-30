# Inbox de conversas WhatsApp via Z-API — Especificação

## Objetivo

Exibir no CRM as conversas existentes na instância de WhatsApp conectada à
Z-API, priorizando as novas conversas iniciadas pelos leads vindos do tráfego
pago.

## Escopo V1 aprovado

- Página protegida `/conversas`.
- Consulta server-side ao endpoint de chats da Z-API.
- Lista somente leitura com nome, telefone, última interação, não lidas,
  grupo/individual e flags de arquivamento, fixação, silenciamento e spam.
- Filtros locais para todos, não lidos, individuais e grupos.
- Grupos ocultos por padrão para manter o foco em oportunidades iniciadas por
  pessoas.
- Mensagens não são enviadas, chats não são marcados como lidos e nenhuma ação
  destrutiva é disponibilizada.
- Credenciais da Z-API permanecem exclusivamente no servidor.

## Fora do escopo V1

- Conteúdo e linha do tempo completa das mensagens.
- Envio de mensagens, respostas automáticas ou campanhas.
- Marcação automática como lida, arquivamento, exclusão ou alteração de chats.
- Persistência no Supabase e webhooks.

## Evolução prevista

A linha do tempo completa será implementada em etapa separada, com webhook de
mensagens recebidas, validação de assinatura/token quando disponível,
idempotência e persistência mínima no Supabase. Essa etapa somente será
ativada após revisão de retenção, permissões e segurança dos dados.

## Critérios de aceite

1. Um administrador autenticado acessa `/conversas` e vê a lista retornada pela
   instância conectada.
2. O navegador nunca recebe `ZAPI_INSTANCE_TOKEN` ou `ZAPI_CLIENT_TOKEN`.
3. Respostas de erro da Z-API são convertidas em mensagem genérica sem vazar
   detalhes do provedor.
4. A interface deixa explícito que a V1 é leitura da lista de chats e não
   histórico completo.
