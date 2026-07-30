# Conversas WhatsApp operacionais via Z-API — Especificação

## Objetivo

Evoluir a página `/conversas` de uma lista de chats para uma caixa de entrada
operacional que espelhe, a partir da ativação dos webhooks, as mensagens
recebidas e enviadas pelo número conectado à Z-API e permita respostas manuais
de texto pelo CRM.

## Escopo aprovado

- Lista de chats da instância Z-API existente.
- Seleção de um contato individual para abrir sua linha do tempo no CRM.
- Recebimento de novas mensagens por webhook HTTPS da Z-API.
- Registro normalizado das mensagens recebidas e enviadas no Supabase.
- Envio manual de texto para o contato selecionado pelo endpoint `send-text`.
- Confirmação visual de envio, status e falhas sem exibir detalhes sensíveis do
  provedor.
- Atualização periódica da conversa aberta e da lista, sem dependência inicial
  de Supabase Realtime.
- Acesso restrito a administradores autenticados.

## Regras operacionais

- Toda resposta é manual, individual e vinculada ao contato selecionado.
- Não haverá disparo em massa, automação, campanha, resposta automática ou
  iniciação de contato pelo CRM.
- A primeira versão suporta somente texto; áudio, imagem, documento, sticker,
  localização, enquete e outros tipos ficam para etapa posterior.
- O CRM não marca chats como lidos automaticamente.
- O CRM não arquiva, exclui, silencia ou altera chats nesta etapa.
- O corpo da mensagem deve ser não vazio após trim e ter limite de 4.000
  caracteres.
- O telefone deve pertencer ao chat selecionado e ser enviado no formato de
  identificador retornado pela Z-API; não haverá campo livre para disparo a
  números arbitrários.

## Limite de histórico

O endpoint de chats da Z-API fornece metadados e última interação, não uma
linha do tempo completa recuperável para importar retroativamente. Portanto,
mensagens anteriores à ativação do webhook poderão não aparecer no CRM. A
partir da ativação, eventos recebidos e enviados serão persistidos e exibidos.

## Arquitetura e fluxo

1. A Z-API chama `POST /api/webhooks/zapi/received/<secret>` para mensagens
   recebidas e `POST /api/webhooks/zapi/delivery/<secret>` para mensagens
   enviadas.
2. Cada rota valida o segredo de caminho, confirma que `instanceId` coincide
   com a configuração server-side e normaliza somente campos necessários.
3. O Supabase faz upsert da conversa e insere a mensagem com idempotência por
   instância e `messageId` do provedor.
4. A tela protegida consulta `/api/conversas/[phone]/mensagens` para carregar
   a linha do tempo persistida e atualiza a cada poucos segundos.
5. Ao clicar em enviar, o servidor valida a sessão, o chat selecionado e o
   texto; chama `send-text` com `phone` e `message`; depois o webhook de envio
   confirma o `messageId` e o status.

## Persistência mínima

Serão criadas tabelas protegidas por RLS:

- `whatsapp_conversations`: `id`, `instance_id`, `phone`, `name`,
  `is_group`, `last_message_at`, `created_at`, `updated_at`.
- `whatsapp_messages`: `id`, `conversation_id`, `instance_id`,
  `provider_message_id`, `phone`, `direction` (`inbound` ou `outbound`),
  `message_type` (`text`), `body`, `status`, `occurred_at`, `created_by`,
  `created_at`.
- Restrição única em `(instance_id, provider_message_id)` para evitar
  duplicidade de reentrega dos webhooks.
- Não serão armazenados tokens da Z-API nem payloads brutos completos; apenas
  o subconjunto normalizado necessário para operação e auditoria.

## Segurança

- Tokens da Z-API continuam exclusivamente server-side.
- O webhook usará URL HTTPS e segredo não público em `ZAPI_WEBHOOK_SECRET`.
- Eventos com segredo ausente, instância divergente ou formato inválido serão
  rejeitados sem persistência.
- Rotas de leitura e envio exigem `requireCurrentAdmin`.
- Erros do provedor serão convertidos em mensagens genéricas; logs não terão
  conteúdo integral, tokens ou dados desnecessários de contato.
- Não será feito teste de envio real para um lead sem indicação explícita de
  número de teste e mensagem autorizada.

## Interface

- Coluna de chats à esquerda com filtros existentes e indicação de não lidas.
- Painel central com cabeçalho do contato e bolhas de mensagens recebidas e
  enviadas.
- Composer inferior com textarea, contador de caracteres e botão `Enviar`.
- Estado de envio `Enviando…`, confirmação `Enviada` e erro recuperável.
- Aviso permanente: `Resposta manual pelo número conectado · somente texto`.
- Em telas pequenas, lista e conversa tornam-se blocos empilhados.

## Fora do escopo

- Áudio, imagem, documento, mídia, reações, respostas citadas e anexos.
- Automação, IA respondendo sozinha, campanhas e distribuição em massa.
- Marcação automática como lida.
- Importação retroativa garantida do histórico já existente no aparelho.
- Supabase Realtime; poderá ser adicionado após validar o fluxo por polling.

## Critérios de aceite

1. Um administrador consegue selecionar um chat individual e ver mensagens
   persistidas a partir da ativação dos webhooks.
2. Uma resposta de texto manual chega ao telefone selecionado e retorna com
   `messageId`/status registrado.
3. Um webhook repetido não cria mensagem duplicada.
4. Um usuário não autenticado não consegue ler nem enviar mensagens.
5. O navegador nunca recebe credenciais da Z-API.
6. Mensagens com texto vazio, mais de 4.000 caracteres ou telefone diferente
   do chat selecionado são recusadas antes da chamada externa.
