---
title: Sidebar com Visão Geral consolidada
date: 2026-08-04
status: approved
---

# Sidebar com Visão Geral consolidada

## Objetivo

Simplificar a navegação do CRM reunindo Visão geral, Pipeline, Oportunidades, Rotina comercial e Metas em um único item de sidebar chamado **Visão Geral**.

## Decisão de produto

O sidebar não exibirá entradas independentes para Pipeline, Oportunidades, Rotina comercial ou Metas. Esses conteúdos permanecerão na página `/`, organizados como seções internas com seus identificadores atuais:

- `#visao-geral`
- `#pipeline`
- `#oportunidades`
- `#rotina`
- `#metas`

O acesso direto por URL com hash continuará funcionando, mas esses hashes não serão itens de navegação no sidebar.

## Arquitetura de navegação

Todas as rotas autenticadas usarão a mesma configuração de sidebar, com os módulos principais:

1. **Visão Geral** — `/`
2. **Leads** — `/leads`
3. **Conversas** — `/conversas`
4. **WhatsApp** — `/integracoes/whatsapp`
5. **Perfil** — `/perfil`

O item Visão Geral será o único representante dos indicadores, pipeline, oportunidades, rotina e metas. O rodapé continuará exibindo o usuário autenticado, a função e a ação de saída.

## Abordagens consideradas

### A — Menu plano consolidado (recomendada)

Exibir somente os cinco módulos principais e manter as quatro áreas como seções na Visão Geral.

**Vantagens:** menor carga visual, menor ambiguidade, preserva o fluxo de leitura da página inicial e evita duplicação de caminhos.

**Desvantagens:** não há salto visual direto para cada seção a partir do sidebar.

### B — Visão Geral expansível

Exibir Visão Geral como grupo com subitens Pipeline, Oportunidades, Rotina comercial e Metas.

**Vantagens:** mantém atalhos visíveis.

**Desvantagens:** não atende à decisão de transformar os cinco itens em um único menu e mantém a sensação de menu fragmentado.

### C — Rotas independentes para cada área

Criar páginas próprias para Pipeline, Oportunidades, Rotina comercial e Metas.

**Vantagens:** permite fluxos especializados no futuro.

**Desvantagens:** amplia o escopo, duplica contexto e não é necessário para a etapa atual.

## Implementação proposta

- Criar um componente compartilhado de sidebar para impedir divergências entre as rotas autenticadas.
- Criar uma configuração tipada contendo apenas os cinco módulos principais.
- Remover os links separados e suas marcações duplicadas das páginas autenticadas.
- Manter os IDs das seções na Visão Geral e os links internos já existentes no conteúdo.
- Preservar os estados ativo, hover, foco, responsividade e rodapé de conta.
- Não alterar rotas, dados, permissões, APIs ou integrações.

## Critérios de aceitação

- O sidebar mostra apenas um item chamado **Visão Geral** para esse conjunto de áreas.
- Pipeline, Oportunidades, Rotina comercial e Metas não aparecem como itens independentes.
- As seções correspondentes continuam renderizadas na página `/`.
- `/leads`, `/conversas`, `/integracoes/whatsapp` e `/perfil` continuam acessíveis pelo sidebar.
- Todas as rotas autenticadas exibem a mesma hierarquia e os mesmos rótulos.
- O comportamento desktop e mobile permanece utilizável.
- Nenhuma rota ou funcionalidade operacional existente é removida.

## Fora de escopo

- Criar novas páginas para Pipeline, Oportunidades, Rotina comercial ou Metas.
- Alterar os dados exibidos, métricas, permissões ou regras do CRM.
- Redesenhar a identidade visual do sidebar.
