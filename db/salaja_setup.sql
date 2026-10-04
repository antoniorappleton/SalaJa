-- Run once in the shared Comunidade CSJ Supabase SQL Editor.
-- Reservations are private to their requester, except for Admins.
BEGIN;

CREATE TABLE IF NOT EXISTS public.salaja_espacos (
  id text PRIMARY KEY,
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text NOT NULL,
  ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.salaja_reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_utilizador text NOT NULL,
  espaco_id text NOT NULL REFERENCES public.salaja_espacos(id),
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  motivo text NOT NULL CHECK (char_length(trim(motivo)) BETWEEN 3 AND 300),
  detalhes text CHECK (detalhes IS NULL OR char_length(detalhes) <= 2000),
  estado text NOT NULL DEFAULT 'pending'
    CHECK (estado IN ('pending', 'approved', 'rejected')),
  nota_admin text CHECK (nota_admin IS NULL OR char_length(nota_admin) <= 1000),
  revisto_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revisto_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT salaja_reservas_intervalo_valido CHECK (inicio < fim)
);

CREATE INDEX IF NOT EXISTS salaja_reservas_user_inicio_idx
  ON public.salaja_reservas (user_id, inicio DESC);
CREATE INDEX IF NOT EXISTS salaja_reservas_estado_inicio_idx
  ON public.salaja_reservas (estado, inicio);
CREATE INDEX IF NOT EXISTS salaja_reservas_espaco_intervalo_idx
  ON public.salaja_reservas (espaco_id, inicio, fim);

INSERT INTO public.salaja_espacos (id, nome, categoria, descricao) VALUES
  ('capela', 'Capela', 'Especiais', 'Espaço silencioso para reflexão e oração.'),
  ('tenda', 'A Tenda', 'Especiais', 'Espaço alternativo para eventos e convívio ao ar livre.'),
  ('sala_12b', 'Sala 12.ºB', 'Estudo', 'Sala de aula equipada com ecrã interativo e mobiliário moderno.'),
  ('ginasio_novo', 'Ginásio Novo', 'Desporto', 'Instalações modernas para multi-desportos.'),
  ('polidesportivo', 'Polidesportivo', 'Desporto', 'Campo exterior para futebol, ténis e mais.'),
  ('ginasio_velho', 'Ginásio Velho', 'Desporto', 'Espaço clássico para atividades físicas e treinos.'),
  ('sala_profissional', 'Sala do Profissional', 'Estudo', 'Espaço reservado para ensino e formações.'),
  ('floresta', 'Floresta', 'Especiais', 'Espaço focado na natureza e bem-estar.')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  categoria = EXCLUDED.categoria,
  descricao = EXCLUDED.descricao;

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
      AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.salaja_is_school_user()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) ~
    '^[a-z]+(-[a-z]+)*\.[a-z]+(-[a-z]+)*@colegio-ramalhao\.com$';
$$;

ALTER TABLE public.salaja_espacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaja_reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS salaja_espacos_read ON public.salaja_espacos;
CREATE POLICY salaja_espacos_read
  ON public.salaja_espacos FOR SELECT TO authenticated
  USING (ativo OR public.salaja_is_admin());

DROP POLICY IF EXISTS salaja_reservas_read_own_or_admin ON public.salaja_reservas;
CREATE POLICY salaja_reservas_read_own_or_admin
  ON public.salaja_reservas FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.salaja_is_admin());

DROP POLICY IF EXISTS salaja_reservas_request ON public.salaja_reservas;
CREATE POLICY salaja_reservas_request
  ON public.salaja_reservas FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND lower(email_utilizador) = lower(auth.jwt() ->> 'email')
    AND public.salaja_is_school_user()
    AND estado = 'pending'
    AND inicio > now()
    AND revisto_por IS NULL
    AND revisto_em IS NULL
    AND nota_admin IS NULL
  );

CREATE OR REPLACE FUNCTION public.salaja_validar_reserva(
  p_reserva_id uuid,
  p_estado text,
  p_nota_admin text DEFAULT NULL
)
RETURNS public.salaja_reservas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_reserva public.salaja_reservas;
BEGIN
  IF NOT public.salaja_is_admin() THEN
    RAISE EXCEPTION 'Apenas um Admin pode validar reservas.'
      USING ERRCODE = '42501';
  END IF;

  IF p_estado NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Estado de validação inválido.'
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_reserva
  FROM public.salaja_reservas
  WHERE id = p_reserva_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido de reserva não encontrado.'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_reserva.estado <> 'pending' THEN
    RAISE EXCEPTION 'Este pedido já foi validado.'
      USING ERRCODE = '22023';
  END IF;

  IF p_estado = 'approved' THEN
    IF v_reserva.inicio <= now() THEN
      RAISE EXCEPTION 'Não é possível aprovar um pedido cujo horário já começou.'
        USING ERRCODE = '22023';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext('salaja:' || v_reserva.espaco_id), 1);

    IF EXISTS (
      SELECT 1
      FROM public.salaja_reservas r
      WHERE r.espaco_id = v_reserva.espaco_id
        AND r.estado = 'approved'
        AND r.id <> v_reserva.id
        AND r.inicio < v_reserva.fim
        AND r.fim > v_reserva.inicio
    ) THEN
      RAISE EXCEPTION 'Já existe uma reserva aprovada que coincide com este horário.'
        USING ERRCODE = '23P01';
    END IF;
  END IF;

  UPDATE public.salaja_reservas
  SET estado = p_estado,
      nota_admin = nullif(trim(p_nota_admin), ''),
      revisto_por = auth.uid(),
      revisto_em = now()
  WHERE id = p_reserva_id
  RETURNING * INTO v_reserva;

  RETURN v_reserva;
END;
$$;

REVOKE ALL ON FUNCTION public.salaja_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.salaja_is_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.salaja_is_school_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.salaja_is_school_user() TO authenticated;
REVOKE ALL ON FUNCTION public.salaja_validar_reserva(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.salaja_validar_reserva(uuid, text, text) TO authenticated;
GRANT SELECT ON public.salaja_espacos TO authenticated;
GRANT SELECT, INSERT ON public.salaja_reservas TO authenticated;

-- The requested Admin identity is also registered in the shared teachers table.
INSERT INTO public.professores (nome, email, role)
VALUES ('Leonor Castelbranco', 'leonor.castelbranco@colegio-ramalhao.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

COMMIT;
