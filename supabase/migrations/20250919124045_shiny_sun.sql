-- Test User Setup for Legal Planner
-- Run this in Supabase SQL Editor AFTER setting up the main schema

-- This will create a test user account
-- Email: test@legalplanner.com
-- Password: testpass123

-- Note: You'll need to run this in Supabase SQL Editor
-- and then you can login with these credentials

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@legalplanner.com',
  crypt('testpass123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create corresponding profile
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  id,
  'test@legalplanner.com',
  'Test User'
FROM auth.users 
WHERE email = 'test@legalplanner.com';

-- Add some sample tasks for testing
INSERT INTO public.tasks (user_id, pratica, attivita, scadenza, stato, priorita)
SELECT 
  id,
  'Cliente vs Controparte',
  'Deposito ricorso presso il tribunale',
  CURRENT_DATE + INTERVAL '7 days',
  'todo',
  8
FROM auth.users 
WHERE email = 'test@legalplanner.com';

INSERT INTO public.tasks (user_id, pratica, attivita, scadenza, stato, priorita)
SELECT 
  id,
  'Pratica Immobiliare',
  'Revisione contratto di compravendita',
  CURRENT_DATE + INTERVAL '3 days',
  'todo',
  5
FROM auth.users 
WHERE email = 'test@legalplanner.com';

INSERT INTO public.tasks (user_id, pratica, attivita, scadenza, stato, priorita)
SELECT 
  id,
  'Successione Rossi',
  'Presentazione dichiarazione successione',
  CURRENT_DATE - INTERVAL '2 days',
  'done',
  9
FROM auth.users 
WHERE email = 'test@legalplanner.com';