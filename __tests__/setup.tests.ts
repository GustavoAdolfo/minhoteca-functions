import * as path from 'path';
import { config as dotenvConfig } from 'dotenv';

// Carrega envs de teste ANTES de qualquer outra coisa
const envPath = path.resolve(__dirname, '.env.tests');
const result = dotenvConfig({ path: envPath });

if (result.error) {
  console.error('❌ Erro ao carregar .env.tests:', result.error);
}

// Defaults para testes locais (evitam provider chain)
process.env.NODE_ENV = 'test';
process.env.AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? 'test';
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? 'test';

// Desabilita fontes dinâmicas de credencial
delete process.env.AWS_PROFILE;
process.env.AWS_SDK_LOAD_CONFIG = '0';
process.env.AWS_EC2_METADATA_DISABLED = 'true';
