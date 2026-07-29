import { TrustonicClient } from '../modules/trustonic-api-client/index.js';

const API_KEY = '/duzcO1Yu2rZxTHGDgeGn1P2aH+X9m7NxDluBz43Gg9CzqfCjvso9Lb+q4cypw9jB1i0DEPvFQeFj1mzNWRP7g==';
const client = new TrustonicClient(API_KEY);

async function test() {
  try {
    console.log('1. Autenticando...');
    const token = await client.authorize();
    console.log('Token obtenido correctamente:', token.substring(0, 20) + '...');

    console.log('\n2. Obteniendo Tenant Info...');
    const tenantInfo = await client.query.getTenantInfo();
    console.log('Tenant Info:', JSON.stringify(tenantInfo, null, 2));

    console.log('\n3. Obteniendo Inventory Info...');
    const inventoryInfo = await client.query.getInventoryInfo();
    console.log('Inventory Info:', JSON.stringify(inventoryInfo, null, 2));

  } catch (error) {
    console.error('Error durante la prueba:', error.message);
  }
}

test();
