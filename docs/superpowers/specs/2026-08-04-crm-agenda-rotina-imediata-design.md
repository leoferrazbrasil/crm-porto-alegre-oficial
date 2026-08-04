# Agenda operacional da Visão Geral — Especificação

## Objetivo

Transformar a seção **Rotina imediata** da Visão Geral em uma agenda operacional derivada dos registros reais do CRM. Toda oportunidade com `next_action` e `next_action_at` válidos deve aparecer na agenda, permitindo ao operador priorizar respostas a leads, envio de propostas e demais ações agendadas.

## Decisão de produto

- A fonte da agenda é o campo de próxima ação dos leads (`next_action` + `next_action_at`).
- A agenda não deve continuar depender da lista estática `mockTasks` quando a Visão Geral estiver carregando leads.
- Registros com data passada continuam visíveis, identificados como **Vencida**, para que não desapareçam da rotina.
- Registros futuros são ordenados pela data e hora mais próximas.
- O item da agenda deve mostrar a ação, a empresa, a etapa e a data/hora completa.
- Cada item com `leadId` deve permitir abrir o cadastro do lead em `/leads/[id]`.
- A agenda inclui todas as etapas que possuam próxima ação registrada; o fato de um lead estar em `Ganho` ou `Perdido` não apaga seu histórico operacional.

## Modelo de prioridade

A prioridade é derivada exclusivamente da proximidade da data em relação ao momento de referência:

- `Alta`: ação vencida ou prevista para as próximas 24 horas;
- `Média`: ação prevista entre 24 e 72 horas;
- `Baixa`: ação posterior a 72 horas.

Essa prioridade é um apoio visual, não altera a etapa do funil nem cria uma nova regra comercial.

## Estados e vazios

- Data inválida ou ação vazia não entra na agenda.
- Sem itens agendados, a seção mostra uma mensagem operacional clara, sem dados simulados adicionais.
- A data/hora é exibida em pt-BR com dia, mês, ano e horário.

## Responsividade e acessibilidade

- Desktop mantém a agenda no bloco escuro da rotina.
- Mobile usa uma coluna única e conserva leitura de ação, empresa, etapa e horário.
- Links para leads têm foco visível e texto identificável.
- A marcação usa `<time dateTime>` para expor o valor ISO às tecnologias assistivas.

## Fora de escopo

- Criar tabela de tarefas separada no Supabase.
- Marcar ações como concluídas diretamente na agenda.
- Criar notificações, lembretes, automações ou sincronização com calendários externos.
- Alterar as métricas do funil ou as etapas oficiais.

## Critérios de aceite

1. Todo lead com ação e data/hora válidas aparece uma vez na agenda.
2. Leads sem ação ou com data inválida são ignorados.
3. A ordenação é crescente por data/hora.
4. A prioridade é derivada da data de referência de forma determinística.
5. A Visão Geral usa leads persistidos quando existem e os dados simulados apenas no fallback já existente.
6. O usuário consegue abrir o lead associado a partir do item da agenda.
7. Testes, lint e build permanecem aprovados.
