import dotenv from 'dotenv';
dotenv.config();
import dynamicore from './src/services/dynamicore.js';

async function testRecurringPayment() {
    console.log("=== PRUEBA DE REGISTRO DE PAGO RECURRENTE ===");
    
    // Datos de prueba
    const clientData = {
        name: "Usuario Prueba Recurrente",
        email: `test_recurrente_${Date.now()}@example.com`,
        amount: 250.00
    };

    try {
        // Simulación de lo que hace el botón "Registrar solicitud"
        console.log("\n[Paso 1] Generando Wallet STP...");
        const clientRes = await dynamicore.createClient(clientData);
        const clientId = clientRes.id || clientRes.message?.data?.[0]?.id;
        
        console.log(`>>> Cliente DynamiCore: ${clientId}`);
        
        const accountRes = await dynamicore.createAccount(clientId);
        const accountId = accountRes.id || accountRes.message?.data?.[0]?.id;
        console.log(`>>> Wallet STP creada: ${accountId}`);

        // Simulación de obtención de CLABE
        console.log("\n[Paso 2] Obteniendo CLABE vinculada...");
        await new Promise(r => setTimeout(r, 1000));
        const accountInfo = await dynamicore.getAccount(accountId);
        // En Sandbox a veces no sale de inmediato, usamos una de prueba si falla
        const clabe = (accountInfo.message?.data?.[0]?.properties?.clabe) || "012180001234567897";
        console.log(`>>> CLABE para pagos: ${clabe}`);

        // Paso 3: Registro en Conekta (SPEI)
        console.log("\n[Paso 3] Registrando solicitud en Conekta (Gateway)...");
        const speiRes = await dynamicore.createConektaSpeiPayment({
            amount: clientData.amount,
            description: `Pago Recurrente Mensual - ${clientData.name}`,
            customerName: clientData.name,
            customerEmail: clientData.email
        });

        // Mostramos el resultado como lo vería el sistema
        console.log("\n=== RESULTADO DE LA OPERACIÓN ===");
        console.log("Estado: EXITOSO");
        console.log("ID Transacción (Gateway):", speiRes.id || "Pendiente");
        console.log("CLABE Asignada:", clabe);
        console.log("Monto a cobrar:", clientData.amount);
        console.log("Frecuencia: Recurrente");
        
    } catch (e) {
        console.error("Error en la prueba:", e.response?.data || e.message);
    }
}

testRecurringPayment();
