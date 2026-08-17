import dotenv from 'dotenv';
dotenv.config();
import dynamicore from './src/services/dynamicore.js';

async function testFullFlow() {
    console.log("=== INICIANDO PRUEBA DE FLUJO COMPLETO (PDF) ===");
    
    try {
        // 1. Crear Cliente
        console.log("\n1. Creando Cliente...");
        const clientRes = await dynamicore.createClient({
            name: "Prueba Flujo Bantos",
            email: `bantos_flow_${Date.now()}@example.com`,
            phone: "+525512345678"
        });
        
        // El cliente puede venir en un array bajo message.data segun mis pruebas anteriores
        const clientId = clientRes.id || (clientRes.message?.data?.[0]?.id);
        
        if (!clientId) {
            console.error("Error: No se obtuvo clientId", JSON.stringify(clientRes));
            return;
        }
        console.log(`>>> Cliente creado exitosamente. ID: ${clientId}`);

        // 2. Crear Cuenta/Wallet
        console.log("\n2. Creando Wallet/Cuenta...");
        const accountRes = await dynamicore.createAccount(clientId);
        const accountId = accountRes.id || (accountRes.message?.data?.[0]?.id);
        
        if (!accountId) {
            console.error("Error: No se obtuvo accountId", JSON.stringify(accountRes));
            return;
        }
        console.log(`>>> Wallet creada exitosamente. ID: ${accountId}`);

        // 3. Consultar CLABE
        console.log("\n3. Consultando CLABE...");
        await new Promise(r => setTimeout(r, 2000)); // Esperar procesamiento
        const fullAccount = await dynamicore.getAccount(accountId);
        
        // Buscar CLABE en properties.clabe o message.data[0].properties.clabe
        const data = fullAccount.message?.data?.[0] || fullAccount;
        const clabe = data.properties?.clabe;
        
        if (!clabe) {
            console.log(">>> CLABE aún no asignada (esto es normal en Sandbox inmediato)");
            console.log("Respuesta completa:", JSON.stringify(fullAccount));
        } else {
            console.log(`>>> CLABE OBTENIDA: ${clabe}`);
        }

        console.log("\n=== PRUEBA FINALIZADA CON ÉXITO ===");

    } catch (e) {
        console.error("\n!!! ERROR EN EL FLUJO:", e.response?.data || e.message);
    }
}

testFullFlow();
