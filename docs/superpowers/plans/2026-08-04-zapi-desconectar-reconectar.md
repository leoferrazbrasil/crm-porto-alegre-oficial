# Z-API Disconnect and Reconnect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir a desconexão administrativa da instância Z-API e reativar automaticamente o ciclo de QR Code para reconexão na mesma instância.

**Architecture:** O cliente server-only da Z-API ganhará um método `disconnect`, exposto por uma rota `POST` protegida. O painel de integração manterá o estado de desconexão e um polling de QR Code de 15 segundos somente enquanto a instância estiver desconectada, cancelando o ciclo ao reconectar ou desmontar.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase SSR para autenticação, Z-API REST, Vitest e CSS global existente.

## Global Constraints

- Credenciais Z-API permanecem server-side.
- A rota de aplicação será `POST /api/zapi/disconnect`; o provedor é chamado com `GET /disconnect`.
- Apenas administradores autenticados podem desconectar a instância.
- O polling usa intervalo de 15 segundos, sem sobreposição intencional de chamadas.
- Não criar nova instância, cancelar assinatura, alterar webhooks ou automatizar mensagens.

---

### Task 1: Adicionar contrato server-side de desconexão

**Files:**
- Modify: `src/lib/zapi/client.ts`
- Modify: `src/lib/zapi/client.test.ts`

**Interfaces:**
- `ZapiDisconnectResult` será uma união `{ ok: true; message: string | null } | { ok: false; message: string }`.
- `ZapiClient.disconnect(): Promise<ZapiDisconnectResult>` chama `GET https://api.z-api.io/instances/{instanceId}/token/{instanceToken}/disconnect` com `Client-Token`.

- [ ] **Step 1: Write the failing test**

```ts
it("desconecta a instância usando o endpoint oficial", async () => {
  const calls: Array<{ url: string; headers: HeadersInit | undefined }> = [];
  const client = createZapiClient(
    {
      instanceId: "instance-1",
      instanceToken: "token-1",
      clientToken: "client-token-1"
    },
    async (url, init) => {
      calls.push({ url: String(url), headers: init?.headers });
      return jsonResponse({ value: true });
    }
  );

  await expect(client.disconnect()).resolves.toEqual({
    ok: true,
    message: "Número desconectado da Z-API."
  });
  expect(calls).toEqual([
    {
      url: "https://api.z-api.io/instances/instance-1/token/token-1/disconnect",
      headers: { "Client-Token": "client-token-1" }
    }
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/zapi/client.test.ts`

Expected: FAIL because `ZapiClient` does not expose `disconnect`.

- [ ] **Step 3: Write minimal implementation**

Add `ZapiDisconnectResult`, add `disconnect` to `ZapiClient`, call `callZapi(config, fetcher, "disconnect")`, return the safe error for non-2xx responses and the success message when the provider returns successfully.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/zapi/client.test.ts`

Expected: PASS.

### Task 2: Criar a rota administrativa

**Files:**
- Create: `src/app/api/zapi/disconnect/route.ts`
- Create: `src/app/api/zapi/disconnect/route.test.ts`

**Interfaces:**
- `POST /api/zapi/disconnect` chama `requireCurrentAdmin`, lê `readZapiConfig`, executa `client.disconnect()` e retorna JSON seguro.

- [ ] **Step 1: Write the failing test**

Adicionar um teste estrutural que leia o arquivo da rota e confirme `requireCurrentAdmin`, `createZapiClient`, `client.disconnect()` e `export async function POST`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/api/zapi/disconnect/route.test.ts`

Expected: FAIL porque a rota ainda não existe.

- [ ] **Step 3: Write minimal implementation**

Criar a rota com o mesmo padrão de `status/route.ts`: autenticação administrativa, configuração segura, status HTTP `200` quando `ok`, `400` para configuração incompleta e `502` para erro do provedor.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/api/zapi/disconnect/route.test.ts`

Expected: PASS.

### Task 3: Integrar botão e ciclo de QR Code no painel

**Files:**
- Modify: `src/app/integracoes/whatsapp/WhatsAppConnectionPanel.tsx`
- Modify: `src/app/globals.css`
- Create: `src/app/integracoes/whatsapp/WhatsAppConnectionPanel.test.ts`

**Interfaces:**
- O painel mantém `disconnectState` e `qrPollingEnabled`.
- `loadQrCode` aceita uma chamada visível e uma chamada silenciosa de atualização.
- O polling de 15 segundos é encerrado quando `status.connected === true` ou quando o componente desmonta.

- [ ] **Step 1: Write the failing test**

Adicionar teste estrutural confirmando `Desconectar número`, `/api/zapi/disconnect`, `setQrPollingEnabled`, `setQrCode(null)` e `setInterval`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/integracoes/whatsapp/WhatsAppConnectionPanel.test.ts`

Expected: FAIL porque o painel ainda não possui a ação nem o polling.

- [ ] **Step 3: Write minimal implementation**

Adicionar confirmação nativa (`window.confirm`), chamada `POST`, estado de carregamento, limpeza do QR Code anterior, consulta imediata de novo QR Code e efeito com intervalo de 15 segundos. Interromper o polling ao receber status conectado. Mostrar botão apenas para status conectado e mensagem de sucesso/erro sem credenciais.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/integracoes/whatsapp/WhatsAppConnectionPanel.test.ts src/lib/zapi/client.test.ts`

Expected: PASS.

### Task 4: Documentar e entregar

**Files:**
- Create: `docs/jornada/2026-08-04-registro-zapi-desconectar-reconectar.md`
- Modify: `Cofre Comercial Porto Alegre Digital/04 - CRM/Registro de Manutenção — Webhook Z-API v6.md`
- Modify: `Cofre Comercial Porto Alegre Digital/90 - Governança/Mapa de Entregáveis.md`
- Create: `artifacts/crm-porto-alegre-oficial-hostinger-v16.zip`

- [ ] **Step 1: Document the factual state**

Registrar endpoint, proteção administrativa, polling de 15 segundos, limites e dependência de deploy. Não inserir tokens, URLs privadas ou dados pessoais.

- [ ] **Step 2: Run full verification**

Run: `npm test; npm run lint; npm run build; git diff --check`

Expected: all checks pass.

- [ ] **Step 3: Package and publish**

Após commit, gerar o pacote com `git archive`, verificar ausência de `.env.local`, `node_modules` e `.next`, e fazer commit/push na `main`.

