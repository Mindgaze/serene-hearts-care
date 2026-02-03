-- ============================================
-- SERENIDADE - SCHEMA COMPLETO
-- ============================================

-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('titular', 'dependente', 'admin');

-- Enum para status de pagamento
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- Enum para status de obituário
CREATE TYPE public.obituary_status AS ENUM ('rascunho', 'publicado', 'arquivado');

-- ============================================
-- TABELA: plans (Planos disponíveis)
-- ============================================
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'individual', 'familiar', 'gold', 'platinum'
  price DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_dependents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Planos ativos são públicos
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active plans" ON public.plans
  FOR SELECT USING (is_active = true);

-- ============================================
-- TABELA: profiles (Perfis de usuários)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  titular_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'titular',
  plan_id UUID REFERENCES public.plans(id),
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint: Dependente DEVE ter titular_id
  CONSTRAINT dependente_must_have_titular 
    CHECK (role != 'dependente' OR titular_id IS NOT NULL)
);

-- Índices para performance
CREATE INDEX idx_profiles_titular ON public.profiles(titular_id);
CREATE INDEX idx_profiles_plan ON public.profiles(plan_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- RLS: Usuário vê próprio perfil + dependentes (se titular)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função helper para evitar recursão infinita
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Titular can view dependents" ON public.profiles
  FOR SELECT USING (auth.uid() = titular_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TABELA: payments (Histórico financeiro)
-- 🚨 CRÍTICO: Apenas titulares acessam
-- ============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  external_id TEXT, -- Stripe/Asaas ID
  invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX idx_payments_due_date ON public.payments(due_date);

-- 🔒 RLS CRÍTICO: APENAS TITULARES
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Titular can view own payments" ON public.payments
  FOR SELECT USING (
    auth.uid() = user_id 
    AND public.has_role(auth.uid(), 'titular')
  );

CREATE POLICY "Admin can view all payments" ON public.payments
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TABELA: obituaries (Obituários)
-- ============================================
CREATE TABLE public.obituaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE,
  death_date DATE NOT NULL,
  photo_url TEXT,
  biography TEXT,
  funeral_location TEXT,
  funeral_datetime TIMESTAMPTZ,
  video_stream_url TEXT,
  video_password TEXT, -- bcrypt hash
  status public.obituary_status NOT NULL DEFAULT 'rascunho',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance e busca
CREATE INDEX idx_obituaries_slug ON public.obituaries(slug);
CREATE INDEX idx_obituaries_death_date ON public.obituaries(death_date DESC);
CREATE INDEX idx_obituaries_status ON public.obituaries(status);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_obituaries_name_trgm ON public.obituaries USING gin(full_name gin_trgm_ops);

-- RLS: Públicos apenas se publicados
ALTER TABLE public.obituaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published obituaries" ON public.obituaries
  FOR SELECT USING (status = 'publicado');

CREATE POLICY "Admin can manage all obituaries" ON public.obituaries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TABELA: partners (Parceiros credenciados)
-- ============================================
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'farmacia', 'clinica', 'floricultura'
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  discount_text TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partners_category ON public.partners(category);
CREATE INDEX idx_partners_city ON public.partners(city);

-- RLS: Parceiros ativos são públicos
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active partners" ON public.partners
  FOR SELECT USING (is_active = true);

-- ============================================
-- TABELA: user_roles (Controle de roles separado)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-criar profile ao signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    'titular'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'titular');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_obituaries_updated_at
  BEFORE UPDATE ON public.obituaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- DADOS INICIAIS: Planos
-- ============================================
INSERT INTO public.plans (slug, name, type, price, max_dependents, features) VALUES
('individual', 'Plano Individual', 'individual', 89.90, 0, '["Assistência 24h", "Traslado até 100km", "Urna padrão", "Velório por 6h", "Carteirinha digital"]'::jsonb),
('familiar', 'Plano Familiar', 'familiar', 149.90, 4, '["Tudo do Individual", "Até 4 dependentes", "Traslado até 200km", "Urna intermediária", "Velório por 12h", "Velório online"]'::jsonb),
('gold', 'Plano Gold', 'gold', 249.90, 6, '["Tudo do Familiar", "Até 6 dependentes", "Traslado ilimitado", "Urna premium", "Velório por 24h", "Floricultura inclusa", "Cremação opcional"]'::jsonb),
('platinum', 'Plano Platinum', 'platinum', 399.90, 10, '["Tudo do Gold", "Até 10 dependentes", "Concierge dedicado", "Jazigo perpétuo", "Seguro de vida", "Descontos em parceiros"]'::jsonb);