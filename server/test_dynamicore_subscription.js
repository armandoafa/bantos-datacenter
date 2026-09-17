import dotenv from 'dotenv';
dotenv.config();
import dynamicore from './src/services/dynamicore.js';

const CUSTOMER_ID = "d5eb476a-dc9b-481f-9d7e-dbc1e135944b"; 
const PAYMENT_METHOD = "07e6fc13-9348-4082-9290-19e8827de2d5";
const RECURRING_DATES = [15]; // Días 15 de cada mes
const AMOUNT = 2.00; // Monto inicial

async function testSubscriptionFlow() {
    console.log("\n=======================================================");
    console.log("=== PRUEBA DE FLUJO DE SUSCRIPCIÓN CON DYNAMICORE ===");
    console.log("=======================================================\n");

    try {
        console.log(`✅ Cliente a utilizar: ${CUSTOMER_ID}\n`);

        // PASO 1: Cobro Inicial ($2.00) y activación de recurrencia
        console.log("👉 [1] Ejecutando Cargo Inicial y Activando Recurrencia...");
        const chargePayload = {
            payment_method: PAYMENT_METHOD,
            customer_id: CUSTOMER_ID,
            amount: AMOUNT,
            sc: 0,
            accept_url: 'https://bantos.cloud/datacenter/',
            cancel_url: 'https://bantos.cloud/datacenter/',
            recurrent: true,
            recurring: { type: "mensual" } 
        };
        
        console.log("📤 Request (Cargo):", JSON.stringify(chargePayload, null, 2));
        const chargeRes = await dynamicore.recurringCharge(chargePayload);
        console.log("✅ Response (Cargo):", JSON.stringify(chargeRes, null, 2));


        // PASO 2: Creación de la Suscripción (Fechas)
        console.log("\n👉 [2] Creando Suscripción para los días", RECURRING_DATES.join(', '));
        const subPayload = {
            customer_id: CUSTOMER_ID,
            payment_method: PAYMENT_METHOD,
            recurring_dates: RECURRING_DATES
        };
        
        console.log("📤 Request (Suscripción):", JSON.stringify(subPayload, null, 2));
        const subRes = await dynamicore.subscribe(subPayload);
        console.log("✅ Response (Suscripción):", JSON.stringify(subRes, null, 2));
        
        console.log("\n🚀 ¡Flujo completado exitosamente!");
        
    } catch (e) {
        console.error("\n❌ Error en el flujo de pruebas:");
        if (e.response?.data) {
            console.error(JSON.stringify(e.response.data, null, 2));
        } else {
            console.error(e.message || e);
        }
    } finally {
        process.exit(0);
    }
}

testSubscriptionFlow();
