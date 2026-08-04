# Funil de Vendas — Rota e etapas operacionais

## Objetivo

Renomear a página de Pipeline para **Funil de Vendas**, trocar a rota pública `/pipeline` por `/funil` e alinhar o Kanban e o estado da jornada do contato ao fluxo operacional aprovado.

## Decisão

O funil terá seis etapas, na ordem:

1. Novo
2. Qualificando
3. Negociação
4. Proposta
5. Ganho
6. Perdido

O contato começa em **Novo**. A etapa é atualizada manualmente após a tratativa e novas mensagens inbound não devem redefini-la.

Os estados antigos `Qualificado`, `Sem interesse`, `Engano` e `Spam` deixam de ser opções da jornada. Dados existentes serão normalizados para as etapas novas por migration, preservando a continuidade do histórico por meio do ledger de eventos.

## Regras de conversão

- Conversa nova: `Novo`.
- Qualificação em andamento: `Qualificando`.
- A conversão explícita de contato em lead fica disponível a partir de `Negociação`.
- Lead criado a partir da conversa entra em `Negociação`.
- A proposta é representada por `Proposta`.
- Fechamentos são representados por `Ganho` e `Perdido`.

## Navegação

- Sidebar: **Funil de Vendas**.
- Rota canônica: `/funil`.
- `/pipeline` permanece apenas como redirecionamento de compatibilidade para `/funil`.

## Critérios de aceite

- O sidebar não exibe o rótulo `Pipeline`.
- `/funil` renderiza as seis colunas na ordem definida, inclusive vazias.
- O formulário de lead usa somente as seis etapas novas.
- A caixa de entrada exibe e permite selecionar somente os seis estados novos.
- A migration converte valores antigos em novos e adiciona restrições para impedir novos estados fora do modelo.
- Mensagens novas não alteram a etapa já persistida da conversa.
- Testes, lint e build passam.
