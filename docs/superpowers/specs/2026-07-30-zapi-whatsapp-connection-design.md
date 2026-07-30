# Z-API WhatsApp Connection Design

## Objetivo

Criar uma primeira versão segura da integração com Z-API para conectar um número de WhatsApp à instância através de leitura de QR Code dentro do CRM da Porto Alegre Oficial.

## Escopo aprovado

- Exibir o status da instância Z-API no CRM.
- Exibir QR Code em imagem base64 para leitura no WhatsApp.
- Manter credenciais Z-API exclusivamente no servidor.
- Permitir atualização manual do QR Code pela interface.
- Incluir orientação operacional sobre expiração do QR Code e challenge/passkey.
- Disponibilizar navegação protegida em `/integracoes/whatsapp`.

## Fora do escopo

- Envio automático de mensagens.
- Disparos em massa.
- Automação de prospecção, follow-up ou recuperação.
- Webhooks de mensagens.
- Leitura automática.
- Sincronização de contatos, chats ou histórico.
- Qualquer integração com Instagram.

## Arquitetura

A aplicação Next.js chamará a Z-API apenas pelo servidor. O frontend acessará rotas internas autenticadas do CRM:

- `GET /api/zapi/status`
- `GET /api/zapi/qrcode`

Essas rotas validarão a sessão administrativa atual antes de chamar a Z-API.

## Credenciais

As credenciais serão configuradas como variáveis de ambiente server-side:

- `ZAPI_INSTANCE_ID`
- `ZAPI_INSTANCE_TOKEN`
- `ZAPI_CLIENT_TOKEN`

Nenhuma dessas variáveis deve usar prefixo `NEXT_PUBLIC_`.

## Endpoints externos usados

- `GET https://api.z-api.io/instances/{instanceId}/token/{token}/status`
- `GET https://api.z-api.io/instances/{instanceId}/token/{token}/qr-code/image`

Ambos usam o header:

- `Client-Token: {ZAPI_CLIENT_TOKEN}`

## Segurança operacional

A V1 apenas conecta e consulta estado. A presença de uma instância conectada não autoriza envio automático de mensagens. Qualquer envio, webhook ou automação deve passar por aprovação separada.

## Tratamento de erros

- Credenciais ausentes retornam erro operacional seguro, sem revelar valores.
- Erros da Z-API retornam mensagem genérica para a interface.
- Challenge/passkey será apresentado como estado especial, orientando validação adicional no WhatsApp/Z-API.
- Se o QR Code não estiver disponível, a interface orienta tentar novamente após alguns segundos.

## Testes esperados

- Montagem correta de URLs e headers da Z-API.
- Bloqueio quando variáveis obrigatórias estiverem ausentes.
- Normalização de status conectado/não conectado.
- Normalização de QR Code base64 e challenge.
- Rotas internas chamam a camada de integração e retornam JSON seguro.
