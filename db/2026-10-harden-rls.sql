-- ============================================================
-- Endurecimiento de RLS — resumika (proyecto Supabase "Cvplus")
-- Ejecutar en Supabase > SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- PASO A — EJECUTAR AHORA (no depende de ningun deploy)
-- ------------------------------------------------------------

-- 1. CRITICO: esta politica estaba aplicada al rol "public" (todo el mundo,
--    incluido anon), no a service_role. Permitia a cualquiera con la clave
--    publica leer/crear/modificar/borrar cualquier perfil (is_admin, is_pro,
--    stripe_customer_id...). service_role ya se salta RLS, asi que sobra.
drop policy if exists "service_role_write_profiles" on public.profiles;

-- 2. Storage avatars: solo el dueno de la carpeta {user_id}/... puede escribir.
--    (antes: cualquier usuario logueado podia borrar/sobrescribir avatares ajenos)
drop policy if exists avatars_insert on storage.objects;
drop policy if exists avatars_update on storage.objects;
drop policy if exists avatars_delete on storage.objects;

create policy avatars_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update to authenticated
  using      (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete on storage.objects for delete to authenticated
  using      (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Funciones SECURITY DEFINER que no deben poder invocarse via /rest/v1/rpc
--    (handle_new_user es un trigger; rls_auto_enable un event trigger;
--     is_user_pro no la usa ningun codigo de la app).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.is_user_pro(uuid) from public, anon, authenticated;

-- 4. search_path fijo. check_username_available se mantiene invocable por anon
--    porque el formulario de registro la usa antes de crear la cuenta.
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.is_user_pro(uuid) set search_path = public, pg_temp;
alter function public.check_username_available(text, uuid) set search_path = public, auth, pg_temp;


-- ------------------------------------------------------------
-- PASO B — EJECUTAR SOLO DESPUES de que este desplegado el commit que mueve
-- /cv/[slug], /crear y /editar/[slug] a lectura server-side (supabaseAdmin).
-- Si se corre antes, las paginas publicas de CV dejan de funcionar.
-- ------------------------------------------------------------

-- La politica "CVs publicos legibles" era SELECT using (true): cualquiera podia
-- descargar todos los CVs completos con la clave publica.
drop policy if exists "CVs públicos legibles" on public.cvs;

-- Cada usuario lee solo sus CVs (por user_id, o por email de su cuenta para los
-- CVs antiguos sin user_id, que es lo que consulta /perfil).
create policy cvs_select_own on public.cvs for select to authenticated
  using (auth.uid() = user_id or lower(email) = lower(auth.jwt() ->> 'email'));
