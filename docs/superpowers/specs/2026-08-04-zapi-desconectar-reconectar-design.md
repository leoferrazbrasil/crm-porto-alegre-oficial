# Desconexão e reconexão da instância Z-API — Especificação

## Objetivo

Permitir que um administrador desconecte o número atualmente vinculado à instância Z-API pelo CRM e, imediatamente depois, retorne ao fluxo normal de conexão por QR Code.

## Decisão de produto

- A ação **Desconectar número** aparece na página de integração quando a instância está conectada.
- A ação exige confirmação explícita no navegador para evitar desconexão acidental.
- O CRM chama uma rota própria protegida (`POST /api/zapi/disconnect`), mantendo as credenciais exclusivamente no servidor.
- A rota usa o endpoint oficial de desconexão da Z-API (`GET /instances/{instanceId}/token/{token}/disconnect`).
- Após sucesso, o painel atualiza o estado para não conectado, limpa o QR Code antigo e solicita um QR Code novo.
- Enquanto a instância estiver desconectada e o ciclo estiver ativo, o CRM consulta novamente o QR Code a cada 15 segundos.
- Ao voltar a conectado, o ciclo automático é interrompido e o QR Code deixa de ser solicitado.

## Estados da interface

- `Conectado`: mostra status e botão de desconexão.
- `Desconectando`: desabilita ações mutáveis e informa o andamento.
- `Não conectado`: mostra QR Code atualizável e botão para consultar status.
- `Erro`: preserva mensagem segura sem exibir detalhes de credenciais ou da API.

## Segurança e limites

- A rota exige `requireCurrentAdmin`.
- Nenhum token ou identificador de instância é enviado ao navegador.
- A confirmação é somente para a ação destrutiva; gerar QR Code e consultar status continuam disponíveis.
- A desconexão interrompe temporariamente o uso da instância e os webhooks até que o número seja reconectado.
- Não criar nova instância, cancelar assinatura, alterar webhooks ou automatizar mensagens.

## Critérios de aceite

1. O cliente Z-API possui `disconnect()` testado com a URL e o header esperados.
2. `POST /api/zapi/disconnect` exige sessão administrativa e retorna erro seguro quando a configuração/API falha.
3. O botão de desconexão aparece somente para instância conectada e evita duplo clique.
4. Após sucesso, o QR Code anterior é removido, um novo é solicitado e a atualização automática inicia.
5. O polling automático ocorre a cada 15 segundos enquanto desconectado e para quando conectado ou quando o componente desmonta.
6. A página permanece responsiva e não expõe credenciais.
