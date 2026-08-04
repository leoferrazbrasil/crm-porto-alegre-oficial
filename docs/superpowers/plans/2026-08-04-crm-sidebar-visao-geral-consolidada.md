# Sidebar com Visão Geral consolidada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar os atalhos de Visão geral, Pipeline, Oportunidades, Rotina comercial e Metas em um único item de sidebar chamado **Visão Geral**, mantendo as demais rotas autenticadas acessíveis e a página inicial intacta.

**Architecture:** Criar uma configuração tipada de navegação e um componente server-side `CrmSidebar` reutilizável. Cada página autenticada continuará responsável por carregar seus dados, mas passará apenas o nome do administrador e o item ativo ao sidebar compartilhado. Pipeline, Oportunidades, Rotina comercial e Metas permanecerão como seções internas da página `/`, sem itens próprios no menu.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Next `Link`, Vitest, Obsidian Flavored Markdown.

## Global Constraints

- Não criar novas rotas para Pipeline, Oportunidades, Rotina comercial ou Metas.
- Não alterar dados, permissões, APIs, integrações ou regras do CRM.
- Preservar os IDs `#visao-geral`, `#pipeline`, `#oportunidades`, `#rotina` e `#metas`.
- Preservar estados visualmente ativo, hover, foco, responsividade, rodapé de conta e ação de saída.
- Não incluir credenciais, tokens, dados pessoais desnecessários ou dados sensíveis na documentação.

---

### Task 1: Definir e testar a configuração de navegação

**Files:**
- Create: `src/components/crm/navigation.ts`
- Test: `src/components/crm/navigation.test.ts`

**Interfaces:**
- Produces `CRM_NAV_ITEMS`, uma lista somente leitura de itens com `id`, `label` e `href`.
- Produces `CrmNavItemId = "overview" | "leads" | "conversations" | "whatsapp" | "profile"`.

- [ ] **Step 1: Escrever o teste que deve falhar**

```ts
import { describe, expect, it } from "vitest";

import { CRM_NAV_ITEMS } from "./navigation";

describe("CRM sidebar navigation", () => {
  it("exposes only the five primary modules", () => {
    expect(CRM_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Visão Geral",
      "Leads",
      "Conversas",
      "WhatsApp",
      "Perfil"
    ]);
  });

  it("does not expose dashboard sections as sidebar items", () => {
    const labels = CRM_NAV_ITEMS.map((item) => item.label);

    expect(labels).not.toEqual(
      expect.arrayContaining([
        "Pipeline",
        "Oportunidades",
        "Rotina comercial",
        "Metas"
      ])
    );
  });
});
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `npm test -- src/components/crm/navigation.test.ts`

Expected: FAIL because `src/components/crm/navigation.ts` does not exist yet.

- [ ] **Step 3: Implementar a configuração mínima**

Criar `CRM_NAV_ITEMS` com esta ordem e caminhos:

```ts
export const CRM_NAV_ITEMS = [
  { id: "overview", label: "Visão Geral", href: "/" },
  { id: "leads", label: "Leads", href: "/leads" },
  { id: "conversations", label: "Conversas", href: "/conversas" },
  { id: "whatsapp", label: "WhatsApp", href: "/integracoes/whatsapp" },
  { id: "profile", label: "Perfil", href: "/perfil" }
] as const;

export type CrmNavItemId = (typeof CRM_NAV_ITEMS)[number]["id"];
```

- [ ] **Step 4: Executar o teste para confirmar a passagem**

Run: `npm test -- src/components/crm/navigation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commitar a unidade de navegação**

```bash
git add src/components/crm/navigation.ts src/components/crm/navigation.test.ts
git commit -m "feat: define consolidated CRM navigation"
```

### Task 2: Criar o sidebar compartilhado

**Files:**
- Create: `src/components/crm/CrmSidebar.tsx`
- Test: `src/components/crm/navigation.test.ts`

**Interfaces:**
- Consumes `CRM_NAV_ITEMS` e `CrmNavItemId` de `navigation.ts`.
- Produces `CrmSidebar({ adminName, activeItem }: { adminName: string; activeItem: CrmNavItemId })`.

- [ ] **Step 1: Ampliar o teste com as regras de seleção**

Adicionar uma função pura exportada, `getCrmNavItemClassName(itemId, activeItem)`, e testar:

```ts
it("marks only the current primary module as active", () => {
  expect(getCrmNavItemClassName("overview", "overview")).toBe(
    "navItem navItemActive"
  );
  expect(getCrmNavItemClassName("leads", "overview")).toBe("navItem");
});
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `npm test -- src/components/crm/navigation.test.ts`

Expected: FAIL because `getCrmNavItemClassName` is not exported yet.

- [ ] **Step 3: Implementar `CrmSidebar`**

O componente deve:

1. Renderizar o mesmo `div.appShell` apenas no consumidor; o componente renderiza somente o `<aside className="sidebar">`.
2. Preservar a imagem `/logo-porto-alegre-oficial.png` com `Image` e `priority`.
3. Renderizar `nav[aria-label="Navegação principal"]` a partir de `CRM_NAV_ITEMS`.
4. Aplicar `navItem navItemActive` somente ao `activeItem`.
5. Renderizar o rodapé com `Acesso atual`, link do administrador para `/perfil`, função `Administrador do CRM` e formulário `POST /auth/sign-out`.
6. Não renderizar Pipeline, Oportunidades, Rotina comercial ou Metas.

Usar `Link` para os cinco caminhos e manter o `navDot` existente para não alterar o CSS.

- [ ] **Step 4: Executar testes e lint**

Run: `npm test -- src/components/crm/navigation.test.ts`

Expected: PASS.

Run: `npm run lint`

Expected: exit code 0.

- [ ] **Step 5: Commitar o componente compartilhado**

```bash
git add src/components/crm/CrmSidebar.tsx src/components/crm/navigation.ts src/components/crm/navigation.test.ts
git commit -m "feat: add shared CRM sidebar"
```

### Task 3: Substituir os sidebars duplicados nas rotas autenticadas

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/leads/page.tsx`
- Modify: `src/app/leads/novo/page.tsx`
- Modify: `src/app/leads/[id]/page.tsx`
- Modify: `src/app/conversas/page.tsx`
- Modify: `src/app/integracoes/whatsapp/page.tsx`
- Modify: `src/app/perfil/page.tsx`

**Interfaces:**
- Each page keeps its existing `requireCurrentAdmin()` call and data-loading behavior.
- Each page renders `<CrmSidebar adminName={adminName} activeItem="..." />` with the matching primary module.

- [ ] **Step 1: Registrar as expectativas de integração**

Antes de editar, criar uma verificação de integração em `src/components/crm/navigation.test.ts` que leia os sete arquivos de página como texto e confirme que cada um contém `CrmSidebar` e não contém os rótulos removidos no bloco de navegação. A verificação deve limitar-se ao texto do componente/sidebar ou usar uma extração simples do trecho entre `<aside` e `</aside>` para não rejeitar títulos de conteúdo que mencionem Pipeline ou Metas.

- [ ] **Step 2: Executar a verificação para confirmar a falha**

Run: `npm test -- src/components/crm/navigation.test.ts`

Expected: FAIL because the pages still contain sidebars locais e os links independentes da Visão Geral.

- [ ] **Step 3: Substituir cada bloco local**

Remover a marcação repetida de `<aside className="sidebar">...</aside>` de cada página e importar `CrmSidebar`.

Usar estes itens ativos:

```tsx
// src/app/page.tsx
<CrmSidebar adminName={adminName} activeItem="overview" />

// src/app/leads/page.tsx, src/app/leads/novo/page.tsx,
// src/app/leads/[id]/page.tsx
<CrmSidebar adminName={adminName} activeItem="leads" />

// src/app/conversas/page.tsx
<CrmSidebar adminName={adminName} activeItem="conversations" />

// src/app/integracoes/whatsapp/page.tsx
<CrmSidebar adminName={adminName} activeItem="whatsapp" />

// src/app/perfil/page.tsx
<CrmSidebar adminName={adminName} activeItem="profile" />
```

Manter o `<main>` e os IDs das seções da página inicial sem alterações. Remover imports `Image` ou `Link` somente quando ficarem sem uso no restante da página.

- [ ] **Step 4: Executar testes, lint e build**

Run: `npm test`

Expected: all tests pass, incluindo a verificação dos sete consumidores.

Run: `npm run lint`

Expected: exit code 0.

Run: `npm run build`

Expected: Next.js compiles successfully and lists the existing authenticated routes.

- [ ] **Step 5: Commitar a consolidação**

```bash
git add src/app/page.tsx src/app/leads/page.tsx src/app/leads/novo/page.tsx "src/app/leads/[id]/page.tsx" src/app/conversas/page.tsx src/app/integracoes/whatsapp/page.tsx src/app/perfil/page.tsx src/components/crm
git commit -m "feat: consolidate CRM overview sidebar"
```

### Task 4: Atualizar o registro do cofre do projeto

**Files:**
- Create: `D:/LEONARDO/Porto Alegre Oficial/Cofre Comercial Porto Alegre Digital/04 - CRM/Registro de Navegação — Visão Geral consolidada.md`
- Modify: `D:/LEONARDO/Porto Alegre Oficial/Cofre Comercial Porto Alegre Digital/90 - Governança/Mapa de Entregáveis.md`

**Interfaces:**
- Consumes the implementation commit, test output and the approved specification.
- Produces a factual Obsidian record without credentials, tokens or unverified UX results.

- [ ] **Step 1: Criar nota factual em UTF-8**

Registrar contexto, decisão, arquivos alterados, testes executados e pendências de validação com uso real. Usar frontmatter, wikilinks para a especificação e para o dicionário do CRM, e declarar explicitamente que o menu foi consolidado sem criar novas rotas.

- [ ] **Step 2: Adicionar a nota ao mapa**

Inserir um link para a nota na seção `Registros recentes` de `Mapa de Entregáveis.md`.

- [ ] **Step 3: Verificar o Markdown**

Run: `Get-Content -Encoding utf8` nas duas notas e confirmar que os arquivos existem, os wikilinks apontam para arquivos existentes e não há segredos.

### Task 5: Verificação final e entrega

**Files:**
- Verify: `src/components/crm/navigation.test.ts`
- Verify: `docs/superpowers/specs/2026-08-04-crm-sidebar-visao-geral-consolidada-design.md`
- Verify: `D:/LEONARDO/Porto Alegre Oficial/Cofre Comercial Porto Alegre Digital/04 - CRM/Registro de Navegação — Visão Geral consolidada.md`

- [ ] **Step 1: Rodar a suíte completa**

Run: `npm test`

Expected: all test files pass with zero failures.

- [ ] **Step 2: Rodar lint e build**

Run: `npm run lint`

Expected: exit code 0.

Run: `npm run build`

Expected: exit code 0 and the existing route list remains present.

- [ ] **Step 3: Revisar o diff e o estado do Git**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; unrelated `artifacts/` and `docs/jornada/` remain unstaged.

- [ ] **Step 4: Registrar a entrega**

Reportar o estado implementado, os testes executados, o commit e o fato de que a confirmação de uso real em desktop/mobile ainda depende de inspeção visual ou operação no navegador.
