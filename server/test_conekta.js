import dynamicore from './src/services/dynamicore.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Testing Conekta SPEI Payment...");
        const orderData = {
            amount: 150.50,
            description: "Pago de Prueba Bantos",
            customerName: "Carlos Garcia",
            customerEmail: "carlos@test.com",
            customerPhone: "+525500000000"
        };
        const res = await dynamicore.createConektaSpeiPayment(orderData);
        console.log("Conekta Result:", res);
    } catch (e) {
        console.error("Conekta Error:", e.response?.data || e.message);
    }
}

test();
