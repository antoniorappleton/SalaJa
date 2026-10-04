# SalaJá

Aplicação web para pedidos de reserva dos espaços do Colégio do Ramalhão. A autenticação reutiliza as contas Supabase da Comunidade CSJ; os pedidos ficam pendentes até serem aprovados ou recusados por um Admin.

## Preparar o backend

1. No SQL Editor do projeto Supabase partilhado com Direção de Turma e Scriptorium, executar [`db/salaja_setup.sql`](./db/salaja_setup.sql).
2. O script cria e protege as tabelas `salaja_espacos` e `salaja_reservas`, instala a função de validação e atribui a função Admin a `leonor.castelbranco@colegio-ramalhao.com` na tabela partilhada `professores`.
3. Confirmar que essa conta consegue iniciar sessão nas outras apps da Comunidade. No SalaJá, usar o mesmo email e palavra-passe.

O pedido de reserva só pode ser criado pelo utilizador autenticado, com email escolar. As políticas RLS impedem a leitura de pedidos de outras pessoas e reservam a validação ao papel `admin`. A aprovação verifica no servidor se já existe outra reserva aprovada para o mesmo espaço e horário. A interface não substitui estas verificações.

## Executar localmente

Servir a pasta através de HTTP, por exemplo com a extensão Live Server do VS Code, e abrir `login.html`. Não abrir os ficheiros diretamente com `file://`. O cliente de autenticação e sessão é carregado da aplicação Direção de Turma publicada; por isso, é necessária ligação à Internet mesmo durante testes locais.

## Fluxo de teste

1. Executar o SQL de preparação e iniciar sessão com uma conta escolar já existente.
2. Criar um pedido futuro em **Pedir reserva** e confirmar que surge como pendente em **As minhas reservas** e no painel Admin.
3. Como `leonor.castelbranco@colegio-ramalhao.com`, aprovar ou recusar o pedido em **Validar pedidos**.
4. Verificar o estado e a nota de decisão na lista do requerente. Tentar aprovar dois pedidos sobrepostos para o mesmo espaço; a segunda aprovação deve ser recusada pelo servidor.

O SQL é um passo manual: a aplicação não consegue alterar o projeto Supabase até este script ser executado pelo respetivo administrador.
