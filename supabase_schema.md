# Supabase Database Schema

Execute this SQL in your Supabase SQL Editor to set up the database:

```sql
-- Enable pgcrypto for password hashing in seeding
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR');
CREATE TYPE status_ativo_inativo AS ENUM ('ATIVO', 'INATIVO', 'DESLIGADO');
CREATE TYPE status_presenca AS ENUM ('PRESENTE', 'FALTOU');
CREATE TYPE user_status AS ENUM ('ATIVO', 'INATIVO');

-- 1. Create Usuarios table (profiles)
CREATE TABLE public.usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'OPERATOR' NOT NULL,
  name TEXT NOT NULL,
  status user_status DEFAULT 'ATIVO' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Obras table
CREATE TABLE public.obras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  status status_ativo_inativo DEFAULT 'ATIVA' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Funcionarios table
CREATE TABLE public.funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID REFERENCES public.obras(id) ON DELETE RESTRICT NOT NULL,
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL,
  valor_diaria NUMERIC(10,2) NOT NULL DEFAULT 0,
  status status_ativo_inativo DEFAULT 'ATIVO' NOT NULL,
  data_desligamento DATE,
  usuario_desligamento_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Presencas table
CREATE TABLE public.presencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE RESTRICT NOT NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE RESTRICT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE RESTRICT NOT NULL,
  status status_presenca NOT NULL,
  valor_pago NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent multiple records for same employee on same date
  CONSTRAINT unique_presenca_diaria UNIQUE (funcionario_id, data)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read for authenticated" ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin write" ON public.usuarios FOR ALL TO authenticated USING ( (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'ADMIN' );

CREATE POLICY "Allow all for authenticated on obras" ON public.obras FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated on funcionarios" ON public.funcionarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated on presencas" ON public.presencas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger to automatically create the profile when a user is created
create or replace function public.handle_new_user()
returns trigger as $$
declare
  extracted_username text;
begin
  -- extract username from 'username@targos.local'
  extracted_username := split_part(new.email, '@', 1);
  
  -- Default to ADMIN if it's Pedro, otherwise OPERATOR
  insert into public.usuarios (id, username, name, role)
  values (
    new.id, 
    extracted_username, 
    upper(extracted_username), 
    case when upper(extracted_username) = 'PEDRO' then 'ADMIN'::user_role else 'OPERATOR'::user_role end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED INITIAL USERS
-- Ensure they do not exist to avoid errors
DO $$
DECLARE
  pedro_uid UUID := gen_random_uuid();
  junior_uid UUID := gen_random_uuid();
  carlos_uid UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pedro@targos.local') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (pedro_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pedro@targos.local', crypt('13052008', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'junior@targos.local') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (junior_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'junior@targos.local', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'carlos@targos.local') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (carlos_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos@targos.local', crypt('1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());
  END IF;
END $$;
```
