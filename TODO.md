# SalaJá — preparação para testes

- [x] Reutilizar autenticação partilhada da Comunidade CSJ.
- [x] Implementar dashboard, pedidos pessoais e formulário de reserva.
- [x] Implementar fila Admin para aprovar/recusar pedidos.
- [x] Proteger pedidos e validação com políticas Supabase RLS.
- [x] Impedir aprovações sobrepostas no servidor.
- [x] Corrigir o âmbito do cache PWA para não interferir com as outras apps.
- [x] Executar `db/salaja_setup.sql` no SQL Editor do Supabase partilhado.
- [x] Implementar gestão de espaços pelo Admin (criar, capacidade, fotografia, ativar/desativar) em `gerir-espacos.html`.
- [ ] Executar `db/add_gerir_espacos.sql` no SQL Editor do Supabase partilhado.
- [ ] Executar `db/add_salaja_admin_flag.sql` no SQL Editor do Supabase partilhado (separa o Admin do SalaJá do `role` partilhado com o Scriptorium).
- [ ] Testar pedido, aprovação, recusa e conflito com duas contas.
- [ ] Publicar depois de validar o fluxo local.
