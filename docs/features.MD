# Board API — Visão Geral de Funcionalidades

API de uma plataforma de coleta e gestão de feedback de usuários. O sistema permite que organizações criem espaços estruturados (boards) para receber sugestões, reportar problemas e acompanhar o progresso de cada feedback por meio de status, tags, votos e comentários. Com controle de acesso baseado em papéis e notificações em tempo real, a plataforma oferece um fluxo completo desde a submissão do feedback até a sua resolução.

---

## Autenticação e Sessão

- Cadastro de novos usuários (registro público)
- Login com email e senha
- Gerenciamento de sessão com tokens de acesso e refresh
- Renovação automática de sessão via refresh token
- Logout com invalidação de sessão
- Consulta do perfil do usuário autenticado

## Perfil do Usuário

- Consulta de perfil de qualquer usuário
- Upload de foto de perfil via URL pré-assinada (upload seguro em duas etapas: solicitação de URL e confirmação)
- Listagem das organizações que o usuário pertence

## Organizações

- Criação de organizações (com geração automática de slug)
- Consulta de detalhes de uma organização
- Provisionamento automático ao criar uma organização:
  - Board padrão criado automaticamente
  - Tags padrão criadas automaticamente
  - Status iniciais criados automaticamente (com definição de status padrão)
- Listagem de boards de uma organização
- Listagem de posts de uma organização com filtros por status, board e tag
- Listagem de membros de uma organização
- Listagem de tags de uma organização
- Listagem de status de uma organização
- Listagem de convites pendentes de uma organização

## Gestão de Membros

- Sistema de papéis (Owner, Admin e Member) com controle de permissões
- Alteração de papel de um membro (restrito ao Owner)
- Remoção de membros da organização (restrito ao Owner)
- Proteção contra remoção do último Owner da organização

## Convites

- Envio de convites por email para ingressar em uma organização
- Consulta de convite por token (acesso público para quem recebeu o link)
- Aceite de convite pelo usuário convidado (com validação de email e expiração)
- Revogação de convites pendentes
- Reenvio de convites com geração de novo token e nova data de expiração (com rate limit de 1 hora)
- Expiração automática de convites vencidos
- Envio de email automático na criação e reenvio de convites

## Boards (Quadros de Feedback)

- Criação de boards dentro de uma organização (restrito a Owner e Admin)
- Consulta de um board por ID
- Listagem de posts de um board com filtros por status e tag
- Gerenciamento de configurações do board (título, descrição, privacidade, bloqueio)
- Exclusão de board (restrito ao Owner)
- Suporte a boards privados e bloqueados (impede novas postagens)

## Posts (Feedbacks)

- Criação de posts vinculados a um board
  - Atribuição automática do status padrão da organização para membros comuns
  - Admins e Owners podem definir status, tags e configurações na criação
- Consulta de um post por ID
- Edição de título e descrição de um post (restrito a Owner, Admin ou autor original)
- Gerenciamento de configurações do post (privacidade, fixação, bloqueio, status)
- Atualização das tags de um post (com validação de que as tags pertencem à organização)
- Exclusão de post (restrito a Owner e Admin)
- Proteção contra postagens em boards bloqueados

## Votação

- Sistema de voto/desvoto (toggle) em posts
- Um usuário pode votar apenas uma vez por post
- Proteção contra votos em posts bloqueados

## Comentários

- Criação de comentários em posts
- Suporte a respostas (replies) em um nível de profundidade
- Edição de comentários (restrito a Owner, Admin ou autor original)
- Exclusão de comentários (restrito a Owner, Admin ou autor original)
- Proteção contra comentários em posts bloqueados
- Validação de que respostas pertencem ao mesmo post do comentário pai

## Status Personalizados

- Criação de status customizados por organização (restrito a Owner e Admin)
- Edição de status existentes (nome e cor)
- Exclusão de status
- Definição de status padrão da organização

## Tags Personalizadas

- Criação de tags customizadas por organização (restrito a Owner e Admin)
- Edição de tags existentes (nome e cor)
- Exclusão de tags
- Criação automática de tags padrão ao criar uma organização

## Notificações

- Notificação automática ao autor do post quando alguém comenta
- Notificação automática ao autor do post quando o status é alterado
- Listagem de notificações do usuário com paginação
- Contagem de notificações não lidas
- Marcar uma notificação individual como lida
- Marcar todas as notificações como lidas
- Dispensar (excluir) uma notificação
- Notificações em tempo real via Server-Sent Events (SSE) com heartbeat

## Controle de Acesso

- Rotas protegidas por autenticação (com exceção de cadastro, login e consulta de convite)
- Controle de permissão baseado em papel dentro da organização (Owner, Admin, Member)
- Permissão especial para autores: podem editar/excluir seus próprios recursos mesmo sem papel administrativo
- Validação de pertencimento à organização antes de operações sensíveis
