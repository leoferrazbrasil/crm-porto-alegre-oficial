---
title: "Registro factual — Desconexão e reconexão da instância Z-API"
date: 2026-08-04
tags:
  - crm
  - whatsapp
  - z-api
  - integracao
  - jornada
status: "implementado localmente; publicação pendente"
---

# Registro factual — Desconexão e reconexão da instância Z-API

## Contexto

Foi solicitada uma ação administrativa na página **Integrações → WhatsApp via Z-API** para desconectar o número vigente e retornar ao fluxo de leitura de QR Code da mesma instância.

## Comportamento aplicado

- O botão **Desconectar número** aparece quando o status consultado indica conexão ativa.
- A ação pede confirmação, chama `POST /api/zapi/disconnect` e mantém as credenciais no servidor.
- A rota chama o endpoint oficial de desconexão da Z-API.
- Após sucesso, o painel limpa o QR Code anterior, mostra o estado não conectado e solicita um novo QR Code.
- Enquanto a instância permanece desconectada, o status e o QR Code são atualizados a cada 15 segundos.
- Quando o status volta a conectado, o polling é interrompido e o QR Code é limpo.

## Alterações técnicas

- `src/lib/zapi/client.ts`: método `disconnect()` e normalização segura do resultado.
- `src/app/api/zapi/disconnect/route.ts`: rota `POST` protegida por administrador.
- `src/app/integracoes/whatsapp/WhatsAppConnectionPanel.tsx`: confirmação, estado de desconexão e ciclo de QR Code.
- `src/app/globals.css`: estilo do botão de desconexão na área de integração.

## Limites factuais

- O código foi validado localmente; não foi executada uma desconexão real nesta sessão.
- O polling não cria instâncias nem altera assinatura ou webhooks.
- A desconexão da Z-API interrompe o uso da instância e os webhooks até a reconexão; essa consequência depende do comportamento do provedor.
- A implantação na Hostinger permanece uma etapa separada.

## Segurança para publicação

- Publicável: descrição geral da funcionalidade e do ciclo de reconexão.
- Interno: rota autenticada, estrutura do cliente e intervalo de polling.
- Sensível: credenciais Z-API, identificadores, tokens, URLs privadas e screenshots com QR Code não devem ser publicados.

