-- =========================================================
-- TABLAS
-- =========================================================
-- Un perfil por cada usuario de Supabase Auth (candidato, empresa o admin)
create table public.perfiles (
id uuid primary key references auth.users (id) on delete cascade,
rol text not null default 'candidato'
check (rol in ('candidato', 'empresa', 'admin')),
nombre text not null,
telefono text,
edad int check (edad between 18 and 120),
colonia text,
experiencia text,
giro text, -- solo empresas
aprobado boolean not null default false, -- RF-054: lo cambia AMAC
creado_en timestamptz not null default now()
);
create table public.vacantes (
id bigint generated always as identity primary key,
empresa_id uuid not null references public.perfiles (id) on delete cascade,
titulo text not null,
sueldo numeric(10,2) not null check (sueldo > 0),
ubicacion text not null,
horario text not null
check (horario in ('Matutino', 'Vespertino', 'Medio tiempo', 'Fines de
semana')),
categoria text not null,
descripcion text not null,
requisitos text not null,
prestaciones text not null,
telefono_contacto text, -- null = solo postulaciones por la plataforma (RF019)
estado text not null default 'activa'
check (estado in ('activa', 'pausada', 'cerrada')),
creada_en timestamptz not null default now()
);
create table public.solicitudes (
id bigint generated always as identity primary key,
vacante_id bigint not null references public.vacantes (id) on delete cascade,
candidato_id uuid not null references public.perfiles (id) on delete cascade,
estatus text not null default 'Enviada'
check (estatus in ('Enviada', 'En revisión', 'Aceptada', 'Rechazada',
'Cancelada')),
creada_en timestamptz not null default now(),
unique (vacante_id, candidato_id) -- RF-004: no aplicar dos veces
);
-- =========================================================
-- CREAR EL PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
-- (los datos llegan en options.data de supabase.auth.signUp)
-- =========================================================
create function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
insert into public.perfiles (id, rol, nombre, telefono, edad, colonia, experiencia, giro)
values (
new.id,
case when new.raw_user_meta_data->>'rol' = 'empresa' then 'empresa' else 'candidato' end,
coalesce(new.raw_user_meta_data->>'nombre', 'Sin nombre'),
new.raw_user_meta_data->>'telefono',
nullif(new.raw_user_meta_data->>'edad', '')::int,
new.raw_user_meta_data->>'colonia',
new.raw_user_meta_data->>'experiencia',
new.raw_user_meta_data->>'giro'
);
return new;
end;
$$;
create trigger al_crear_usuario
after insert on auth.users
for each row execute function public.crear_perfil();
-- =========================================================
-- FUNCIONES AUXILIARES PARA LAS POLÍTICAS
-- (security definer evita que las políticas se llamen entre sí en bucle)
-- =========================================================
create function public.mi_rol()
returns text language sql stable security definer set search_path = '' as $$
select rol from public.perfiles where id = auth.uid()
$$;
create function public.candidato_aprobado()
returns boolean language sql stable security definer set search_path = '' as $$
select exists (
select 1 from public.perfiles
where id = auth.uid() and rol = 'candidato' and aprobado
)
$$;
create function public.candidato_aplico(vid bigint)
returns boolean language sql stable security definer set search_path = '' as $$
select exists (
select 1 from public.solicitudes
where vacante_id = vid and candidato_id = auth.uid()
)
$$;
create function public.empresa_ve_candidato(cid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
select exists (
select 1
from public.solicitudes s
join public.vacantes v on v.id = s.vacante_id
where s.candidato_id = cid and v.empresa_id = auth.uid()
)
$$;
-- =========================================================
-- SEGURIDAD POR FILA (RLS) — RF-010
-- =========================================================
alter table public.perfiles enable row level security;
alter table public.vacantes enable row level security;
alter table public.solicitudes enable row level security;
-- PERFILES
create policy "Cada quien ve su perfil" on public.perfiles
for select using (id = auth.uid());
create policy "Todos ven los perfiles de empresas" on public.perfiles
for select using (rol = 'empresa');
create policy "La empresa ve a quien aplicó a sus vacantes" on public.perfiles
for select using (public.empresa_ve_candidato(id));
create policy "Cada quien edita su perfil" on public.perfiles
for update using (id = auth.uid()) with check (id = auth.uid());
-- Nadie puede cambiarse a sí mismo el rol ni el campo "aprobado"
revoke update on public.perfiles from anon, authenticated;
grant update (nombre, telefono, edad, colonia, experiencia, giro)
on public.perfiles to authenticated;
-- VACANTES
create policy "Ver vacantes activas o las propias" on public.vacantes
for select using (estado = 'activa' or empresa_id = auth.uid());
create policy "El candidato sigue viendo las vacantes a las que aplicó" on public.vacantes
for select using (public.candidato_aplico(id)); -- RF-021: aunque se pausen
create policy "Solo empresas publican, a su nombre" on public.vacantes
for insert with check (empresa_id = auth.uid() and public.mi_rol() = 'empresa');
create policy "La empresa edita sus vacantes" on public.vacantes
for update using (empresa_id = auth.uid()) with check (empresa_id = auth.uid());
-- SOLICITUDES
create policy "Candidato ve las suyas; empresa ve las de sus vacantes" on public.solicitudes
for select using (
candidato_id = auth.uid()
or exists (select 1 from public.vacantes v
where v.id = vacante_id and v.empresa_id = auth.uid())
);
create policy "Solo candidatos aprobados se postulan" on public.solicitudes
for insert with check (
candidato_id = auth.uid()
and estatus = 'Enviada'
and public.candidato_aprobado()
);
create policy "Candidato cancela si no está resuelta" on public.solicitudes
for update
using (candidato_id = auth.uid() and estatus in ('Enviada', 'En revisión'))
with check (candidato_id = auth.uid() and estatus = 'Cancelada');
create policy "Empresa cambia el estatus" on public.solicitudes
for update
using (
estatus <> 'Cancelada'
and exists (select 1 from public.vacantes v
where v.id = vacante_id and v.empresa_id = auth.uid())
)
with check (
estatus in ('En revisión', 'Aceptada', 'Rechazada')
and exists (select 1 from public.vacantes v
where v.id = vacante_id and v.empresa_id = auth.uid())
);
-- De una solicitud solo se puede modificar el estatus
revoke update on public.solicitudes from anon, authenticated;
grant update (estatus) on public.solicitudes to authenticated;



--- Testing
GRANT SELECT ON TABLE public.vacantes TO anon;
GRANT SELECT ON TABLE public.vacantes TO authenticated;

GRANT SELECT (id, nombre)
ON TABLE public.perfiles
TO anon, authenticated;

GRANT SELECT ON TABLE public.perfiles
TO authenticated;

GRANT SELECT
ON TABLE public.solicitudes
TO authenticated;
GRANT INSERT
ON TABLE public.solicitudes
TO authenticated;

GRANT UPDATE ON public.vacantes TO authenticated
GRANT INSERT ON public.vacantes TO authenticated

GRANT SELECT ON public.solicitudes TO authenticated;
GRANT UPDATE (estatus) ON public.solicitudes TO authenticated;
GRANT SELECT ON public.perfiles TO authenticated;
--- 

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
