# Conversão contextual de conversa em lead

## Objetivo

Permitir que o operador transforme uma conversa do WhatsApp em lead sem sair do atendimento, reutilizando as informações já conhecidas e solicitando somente os dados mínimos para completar o cadastro.

## Decisão de UX

Quando a conversa estiver na etapa **Negociação** e ainda não possuir lead vinculado, a caixa de entrada exibirá a ação primária **Transformar em lead**. O clique abrirá um painel de conversão sobre o contexto da conversa.

- Desktop: painel lateral ou diálogo focado sobre a área da conversa.
- Mobile: diálogo em tela cheia, com botão claro de cancelar/voltar.
- A conversa permanece visível ou recuperável; o operador não é enviado para a página geral de leads.
- A ação é explícita e manual. A primeira mensagem nunca cria lead automaticamente.

## Dados do painel

### Herdados e somente leitura

- Nome do contato;
- Telefone;
- Origem do canal;
- Campanha e detalhe de aquisição, quando disponíveis;
- Etapa `Negociação`.

### Preenchidos pelo operador

- Empresa — obrigatório;
- Segmento — obrigatório;
- Próxima ação — obrigatório;
- Data e hora da próxima ação — obrigatório.

Valor estimado e probabilidade permanecem com valores iniciais `0` na primeira versão e podem ser ajustados posteriormente na página do lead.

## Fluxo de dados

1. O operador abre uma conversa.
2. A conversa é conduzida até `Negociação`.
3. O operador clica em **Transformar em lead**.
4. O painel pré-preenche os dados herdados.
5. Ao confirmar, o servidor cria o lead na etapa `Negociação` e vincula `whatsapp_conversations.lead_id`.
6. O evento de vínculo é preservado no ledger `crm_funnel_events`.
7. A caixa de entrada permanece na conversa e mostra **Lead criado** com ação **Abrir lead**.

Se houver erro, nenhuma conversão parcial deve ser apresentada como concluída. O operador recebe mensagem junto ao formulário e pode tentar novamente.

## Estados da interface

- `Novo`/`Qualificando`: mostrar orientação de que a conversão fica disponível em `Negociação`.
- `Negociação` sem lead: mostrar botão de conversão.
- Painel aberto: foco inicial no primeiro campo editável; botões com estado de carregamento e bloqueio contra duplo envio.
- Sucesso: fechar o painel, atualizar o contexto e mostrar link para o lead.
- Lead já vinculado: substituir a conversão por **Abrir lead**.

## Critérios de aceite

- O operador consegue abrir a conversão a partir de uma conversa em `Negociação`.
- Nome e telefone não precisam ser digitados novamente.
- Empresa, segmento, próxima ação e data são validados antes do envio.
- Cancelar não cria lead nem altera a conversa.
- Confirmar cria e vincula um único lead.
- A interface permanece na conversa após o sucesso.
- Acessibilidade: diálogo semântico, foco gerenciado, Escape/cancelar, labels visíveis e mensagens de erro próximas aos campos.
- Testes, lint e build passam.

## Fora de escopo

- Criação automática de leads por mensagem recebida;
- Disparo de mensagens;
- Deduplicação global por telefone entre múltiplas instâncias;
- Reestruturação do formulário completo de leads.
