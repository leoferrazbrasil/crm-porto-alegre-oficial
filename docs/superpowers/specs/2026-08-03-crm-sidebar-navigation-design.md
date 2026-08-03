# Navegação global do CRM — Especificação de design

**Data:** 2026-08-03  
**Status:** Design aprovado pelo usuário; aguardando revisão da especificação escrita

## Objetivo

Unificar a navegação do CRM em um sidebar compartilhado, garantindo que todas as rotas autenticadas exibam os mesmos caminhos principais e que os atalhos internos da Visão geral permaneçam acessíveis sem transformar a interface em uma lista plana e confusa.

## Problema atual

- A rota `/` possui uma navegação própria com nove itens, misturando rotas reais e âncoras de seção.
- As demais rotas autenticadas repetem sidebars independentes com apenas cinco links.
- A marcação do menu está duplicada em sete páginas, permitindo divergências de rótulo, ordem e estado ativo.
- As rotas de criação e edição de leads não têm uma arquitetura de navegação compartilhada.

## Experiência de navegação aprovada

Todas as rotas autenticadas devem exibir o mesmo sidebar, organizado por grupos:

### Operação

- **Visão geral** — `/`
  - **Resumo** — `/#visao-geral`
  - **Pipeline** — `/#pipeline`
  - **Oportunidades** — `/#oportunidades`
  - **Rotina comercial** — `/#rotina`
  - **Metas** — `/#metas`
- **Leads** — `/leads`
- **Conversas** — `/conversas`

### Canais

- **WhatsApp** — `/integracoes/whatsapp`

### Conta

- **Perfil** — `/perfil`

Os módulos principais terão maior destaque visual. Os cinco atalhos da Visão geral serão subitens visualmente subordinados, mas permanecerão disponíveis em qualquer rota. Ao serem acionados a partir de outra página, deverão navegar para a Visão geral e posicionar o usuário na seção correspondente.

## Arquitetura técnica

### Fonte única de navegação

Criar uma configuração tipada de navegação contendo grupos, itens, rótulos, hrefs e tipo (`route` ou `section`). Nenhuma página deverá declarar manualmente os links do sidebar.

### Shell autenticado compartilhado

Criar um shell reutilizável para as rotas protegidas. O shell será responsável por:

- renderizar o sidebar;
- exibir a marca;
- exibir o usuário autenticado e o botão de saída;
- envolver o conteúdo principal;
- preservar as classes visuais já usadas pelo CRM.

As páginas de dashboard, leads, criação/edição de lead, conversas, WhatsApp e perfil deverão fornecer apenas o conteúdo específico da rota ao shell.

### Estado ativo

- O item de rota correspondente ao pathname atual recebe `aria-current="page"` e o estado visual ativo.
- A seção atualmente escolhida na Visão geral recebe estado de localização quando houver hash compatível.
- `/leads/novo` e `/leads/[id]` mantêm **Leads** ativo.
- `/integracoes/whatsapp` mantém **WhatsApp** ativo.
- Rotas de autenticação não usam o shell autenticado.

### Responsividade

Em telas estreitas, o sidebar continua no fluxo da página, com grupos legíveis e subitens em uma coluna. A ordem de navegação deve ser preservada, e nenhum caminho pode desaparecer por causa do breakpoint.

## Critérios de aceite

1. As rotas autenticadas `/`, `/leads`, `/leads/novo`, `/leads/[id]`, `/conversas`, `/integracoes/whatsapp` e `/perfil` renderizam o mesmo conjunto de grupos e links.
2. Nenhuma dessas páginas contém uma implementação local duplicada do sidebar.
3. Todos os links principais estão disponíveis em todas as rotas autenticadas.
4. Os atalhos Pipeline, Oportunidades, Rotina comercial e Metas continuam acessíveis a partir de qualquer rota.
5. O item ativo é correto para rotas principais e subrotas de leads.
6. O usuário e o botão Sair continuam presentes no rodapé do sidebar.
7. A navegação permanece utilizável em viewport desktop e mobile.
8. Os testes e o lint existentes continuam passando.

## Fora de escopo

- Criar novos módulos comerciais além das rotas existentes.
- Alterar regras de autenticação, permissões ou Supabase.
- Redesenhar o conteúdo das páginas.
- Adicionar busca, notificações ou menu de usuário além dos controles atuais.

## Validação

A validação deverá combinar testes unitários da configuração de navegação, inspeção de renderização das rotas autenticadas, `npm run lint` e `npm test` dentro de `D:\LEONARDO\Porto Alegre Oficial\crm`.
