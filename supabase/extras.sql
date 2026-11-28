-- =========================================================
-- EXTRAS (sección 3.2 del PDF)
-- Ejecutar en Supabase → SQL Editor DESPUÉS del script base
-- de la sección 5.5 (tablas perfiles, vacantes, solicitudes,
-- funciones mi_rol() / candidato_aprobado() y sus políticas).
-- =========================================================


-- =========================================================
-- RF-024: FECHA DE CAMBIO DE ESTATUS
-- Cada vez que cambia el estatus de una solicitud se guarda la fecha.
-- El trigger corre en la BD, así nadie puede falsificar la fecha desde el navegador.
-- =========================================================
alter table public.solicitudes
  add column if not exists estatus_actualizado_en timestamptz;

create or replace function public.marcar_cambio_estatus()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.estatus is distinct from old.estatus then
    new.estatus_actualizado_en := now();
  end if;
  return new;
end;
$$;

drop trigger if exists al_cambiar_estatus on public.solicitudes;
create trigger al_cambiar_estatus
  before update on public.solicitudes
  for each row execute function public.marcar_cambio_estatus();


-- =========================================================
-- RF-055: PROCESO DE SELECCIÓN POR ETAPAS
-- La empresa avanza al candidato por etapas mientras la solicitud
-- está "En revisión". La política "Empresa cambia el estatus" del
-- script base ya limita quién puede modificar la fila.
-- =========================================================
alter table public.solicitudes
  add column if not exists etapa text
  check (etapa in ('Revisión de perfil', 'Entrevista', 'Prueba de trabajo', 'Decisión final'));

grant update (etapa) on public.solicitudes to authenticated;


-- =========================================================
-- RF-041: VACANTES FAVORITAS
-- La llave primaria compuesta impide guardar la misma vacante dos veces.
-- OJO: al existir esta tabla hay dos caminos de "vacantes" a "perfiles"
-- (empresa_id y favoritos). En las consultas de React hay que indicar cuál:
--   empresa:perfiles!vacantes_empresa_id_fkey(nombre)
-- Si no, Supabase responde con el error PGRST201.
-- =========================================================
create table if not exists public.favoritos (
  candidato_id uuid   not null references public.perfiles (id) on delete cascade,
  vacante_id   bigint not null references public.vacantes (id) on delete cascade,
  creado_en    timestamptz not null default now(),
  primary key (candidato_id, vacante_id)
);

alter table public.favoritos enable row level security;

drop policy if exists "Candidato ve sus favoritas" on public.favoritos;
create policy "Candidato ve sus favoritas" on public.favoritos
  for select using (candidato_id = auth.uid());

drop policy if exists "Candidato guarda favoritas" on public.favoritos;
create policy "Candidato guarda favoritas" on public.favoritos
  for insert with check (candidato_id = auth.uid() and public.mi_rol() = 'candidato');

drop policy if exists "Candidato quita favoritas" on public.favoritos;
create policy "Candidato quita favoritas" on public.favoritos
  for delete using (candidato_id = auth.uid());


-- =========================================================
-- RF-016: LOGO DE EMPRESA CON SUPABASE STORAGE
-- Bucket público "logos"; cada empresa solo escribe en su carpeta
-- (logos/<id de la empresa>/...). Máximo 2 MB, solo imágenes.
-- =========================================================
alter table public.perfiles
  add column if not exists logo_url text;

-- La política "Cada quien edita su perfil" ya limita la fila a la propia
grant update (logo_url) on public.perfiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Empresa sube su logo" on storage.objects;
create policy "Empresa sube su logo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.mi_rol() = 'empresa'
  );

drop policy if exists "Empresa reemplaza su logo" on storage.objects;
create policy "Empresa reemplaza su logo" on storage.objects
  for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Empresa ve sus archivos de logo" on storage.objects;
create policy "Empresa ve sus archivos de logo" on storage.objects
  for select to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);


-- =========================================================
-- RF-054: PANEL DE ADMINISTRADOR PARA APROBAR CANDIDATOS
-- El administrador se crea a mano: registrarse como candidato y en
-- Table Editor → perfiles cambiar "rol" a 'admin'.
-- "aprobado" sigue sin poder editarse directo (revoke del script base);
-- solo se cambia con esta función, que verifica que quien llama es admin.
-- =========================================================
drop policy if exists "Admin ve todos los perfiles" on public.perfiles;
create policy "Admin ve todos los perfiles" on public.perfiles
  for select using (public.mi_rol() = 'admin');

create or replace function public.cambiar_aprobacion(cid uuid, valor boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.mi_rol() is distinct from 'admin' then
    raise exception 'Solo un administrador puede aprobar candidatos'
      using errcode = '42501';
  end if;

  update public.perfiles
     set aprobado = valor
   where id = cid and rol = 'candidato';
end;
$$;

revoke execute on function public.cambiar_aprobacion(uuid, boolean) from public, anon;
grant execute on function public.cambiar_aprobacion(uuid, boolean) to authenticated;


-- =========================================================
-- RF-029: RECUPERAR CONTRASEÑA
-- No requiere SQL. En Authentication → URL Configuration → Redirect URLs
-- agregar:  https://<su-app>.vercel.app/nueva-contrasena
--           http://localhost:5173/nueva-contrasena
-- (El correo de Supabase sin SMTP propio permite pocos envíos por hora.)
-- =========================================================
