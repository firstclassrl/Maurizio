// Test script per verificare le variabili d'ambiente
// Esegui con: node test-env.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica le variabili d'ambiente manualmente
try {
  const envContent = readFileSync(join(__dirname, '.env.local'), 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  // Simula process.env
  Object.assign(process.env, envVars);
} catch (error) {
  console.log('⚠️ File .env.local non trovato o non leggibile');
}

console.log('🔍 Verifica Configurazione Google Calendar Sync\n');

// Verifica variabili Google OAuth
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

console.log('📋 Google OAuth2:');
console.log(`✅ Client ID: ${googleClientId ? '✅ Configurato' : '❌ Mancante'} ${googleClientId ? `(${googleClientId.substring(0, 20)}...)` : ''}`);
console.log(`✅ Client Secret: ${googleClientSecret ? '✅ Configurato' : '❌ Mancante'} ${googleClientSecret ? `(${googleClientSecret.length} caratteri)` : ''}`);
console.log(`✅ Redirect URI: ${googleRedirectUri || '❌ Mancante'}`);

// Verifica variabili webhook
const webhookBaseUrl = process.env.WEBHOOK_BASE_URL;
const webhookSecret = process.env.WEBHOOK_SECRET;

console.log('\n🌐 Webhook Configuration:');
console.log(`✅ Base URL: ${webhookBaseUrl || '❌ Mancante'}`);
console.log(`✅ Webhook Secret: ${webhookSecret ? '✅ Configurato' : '❌ Mancante'} ${webhookSecret ? `(${webhookSecret.length} caratteri)` : ''}`);

// Verifica variabili Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🗄️ Supabase Configuration:');
console.log(`✅ Supabase URL: ${supabaseUrl ? '✅ Configurato' : '❌ Mancante'}`);
console.log(`✅ Service Role Key: ${supabaseServiceKey ? '✅ Configurato' : '❌ Mancante'}`);

// Riepilogo
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'GOOGLE_REDIRECT_URI',
  'WEBHOOK_BASE_URL',
  'WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

console.log('\n📊 Riepilogo:');
if (missingVars.length === 0) {
  console.log('🎉 Tutte le variabili obbligatorie sono configurate!');
  console.log('✅ Pronto per testare la sincronizzazione Google Calendar');
} else {
  console.log(`❌ Variabili mancanti: ${missingVars.join(', ')}`);
  console.log('🔧 Configura le variabili mancanti in .env.local');
}

console.log('\n🚀 Prossimi passi:');
console.log('1. Esegui la migrazione del database');
console.log('2. Deploya le Edge Functions');
console.log('3. Testa la connessione OAuth');
