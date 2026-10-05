-- SalaJá precisa do seu PRÓPRIO sinalizador de Admin, separado da coluna
-- partilhada `professores.role`.
--
-- `professores` é partilhada entre Scriptorium, Direção de Turma e SalaJá, e
-- `role='admin'` já tem um significado próprio no Scriptorium (ex:
-- antonio.appleton@colegio-ramalhao.com é admin lá). Até agora,
-- salaja_is_admin() (db/salaja_setup.sql) reutilizava essa mesma coluna —
-- o que tornava automaticamente Admin do SalaJá qualquer pessoa marcada como
-- admin no Scriptorium, mesmo sem ser suposto. Só
-- leonor.castelbranco@colegio-ramalhao.com deve poder validar pedidos e
-- gerir espaços no SalaJá.
--
-- Aditivo: não altera a coluna `role` nem nada usado pelo Scriptorium ou
-- pela Direção de Turma.
--
-- Execute este ficheiro no SQL Editor do Supabase, depois de
-- db/salaja_setup.sql e db/add_gerir_espacos.sql.

BEGIN;

ALTER TABLE public.professores ADD COLUMN IF NOT EXISTS salaja_admin boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.salaja_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.professores p
    WHERE lower(p.email) = lower(auth.jwt() ->> 'email')
      AND p.salaja_admin = true
  );
$$;

UPDATE public.professores SET salaja_admin = true
WHERE lower(email) = 'leonor.castelbranco@colegio-ramalhao.com';

COMMIT;
