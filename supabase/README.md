# Preparação do Supabase

A primeira versão do CRM funciona localmente com dados simulados. Estes arquivos deixam o contrato do banco preparado para uma conexão posterior, sem incluir credenciais reais no repositório.

## Configuração local

1. Copie `.env.example` para `.env.local`.
2. Preencha somente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Nunca adicione a chave `service_role` ao frontend ou ao Git.
4. Execute `supabase/schema.sql` no SQL Editor do projeto Supabase.

Sem essas variáveis, `getSupabaseBrowserClient()` retorna `null` e a aplicação permanece em modo local.

## Perfis de acesso

- `operator`: Leonardo, com permissão para criar e alterar leads, tarefas e eventos.
- `viewer`: proprietário, com acesso de leitura aos dados da operação.

O primeiro perfil operador deve ser criado administrativamente após o cadastro do usuário. A `service_role` deve permanecer restrita ao ambiente seguro do Supabase.

## Limites da V1

- Não existe integração direta com Instagram.
- Leads originados no Instagram são cadastrados manualmente.
- Não existe automação de mensagens, publicação ou engajamento.
- O schema registra eventos para auditoria futura, mas a interface local ainda não persiste dados.

