# Funil de Vendas — Plano de implementação

> **Para trabalhadores agentic:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para executar este plano tarefa por tarefa.

**Goal:** substituir Pipeline por Funil de Vendas e alinhar contatos e leads a seis etapas operacionais.

**Architecture:** A rota canônica será `/funil`; `/pipeline` fará redirecionamento compatível. O mesmo vocabulário de etapas será usado no domínio de leads e nos estados da conversa, com uma migration de normalização para o Supabase.

## Tarefas

- [x] Atualizar testes de navegação, etapas, formulário e qualificação para o vocabulário novo.
- [x] Alterar `PIPELINE_STAGES`, cálculos, dados de demonstração e normalizadores.
- [x] Alterar o estado da jornada da caixa de entrada e a regra de conversão para `Negociação`.
- [x] Criar `/funil`, redirecionar `/pipeline` e atualizar textos/estilos do Kanban.
- [x] Criar migration de normalização dos estágios e atualizar documentação/cofre.
- [x] Executar testes, lint, build, diff check, gerar pacote e publicar na `main`.
