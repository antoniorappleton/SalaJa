-- Permite ao Admin (Leonor) gerir os espaços a partir da própria app: criar
-- novos espaços, definir capacidade (nº de lugares) e carregar fotografia —
-- sem precisar de SQL manual nem de incluir imagens no repositório.
-- Aditivo: não altera nem apaga nada existente.
--
-- Execute este ficheiro no SQL Editor do Supabase, depois de
-- db/salaja_setup.sql.

BEGIN;

ALTER TABLE public.salaja_espacos ADD COLUMN IF NOT EXISTS capacidade integer
  CHECK (capacidade IS NULL OR capacidade > 0);
ALTER TABLE public.salaja_espacos ADD COLUMN IF NOT EXISTS imagem_path text;

-- A leitura (SELECT) já estava aberta a todos os autenticados via
-- salaja_espacos_read (db/salaja_setup.sql) — esta política acrescenta
-- criação/edição, só para quem é Admin.
DROP POLICY IF EXISTS salaja_espacos_admin_manage ON public.salaja_espacos;
CREATE POLICY salaja_espacos_admin_manage
  ON public.salaja_espacos FOR ALL TO authenticated
  USING (public.salaja_is_admin())
  WITH CHECK (public.salaja_is_admin());

GRANT INSERT, UPDATE ON public.salaja_espacos TO authenticated;

-- Bucket público: fotografias de espaços não são informação sensível, e
-- assim a app pode mostrá-las com um URL direto, sem gerir expiração de
-- signed URLs (ao contrário do bucket privado "documentos-dt" da Direção de
-- Turma, que guarda documentos pessoais).
INSERT INTO storage.buckets (id, name, public)
VALUES ('salaja-espacos', 'salaja-espacos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS salaja_espacos_storage_read ON storage.objects;
CREATE POLICY salaja_espacos_storage_read
  ON storage.objects FOR SELECT
  USING (bucket_id = 'salaja-espacos');

DROP POLICY IF EXISTS salaja_espacos_storage_admin_write ON storage.objects;
CREATE POLICY salaja_espacos_storage_admin_write
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'salaja-espacos' AND public.salaja_is_admin());

DROP POLICY IF EXISTS salaja_espacos_storage_admin_update ON storage.objects;
CREATE POLICY salaja_espacos_storage_admin_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'salaja-espacos' AND public.salaja_is_admin())
  WITH CHECK (bucket_id = 'salaja-espacos' AND public.salaja_is_admin());

DROP POLICY IF EXISTS salaja_espacos_storage_admin_delete ON storage.objects;
CREATE POLICY salaja_espacos_storage_admin_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'salaja-espacos' AND public.salaja_is_admin());

COMMIT;

-- Nota: se o INSERT em storage.buckets falhar por restrição do plano
-- Supabase, cria o bucket manualmente em Studio → Storage → New bucket, com
-- o nome "salaja-espacos" e "Public bucket" MARCADO — depois corre o resto
-- deste ficheiro normalmente (o INSERT com ON CONFLICT torna-se no-op).
