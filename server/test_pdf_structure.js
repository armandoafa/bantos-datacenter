import dynamicore from '/home/armandoafa/Projects/bantos-frontend/bantos-cloud-services/server/src/services/dynamicore.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    // Estructura EXACTA del PDF: Documentacion_Tecnica_Clientes_Wallet_CLABE.pdf
    // Campos clave: status, pii.name, pii.phone, pii.email, client_type
    const payload = {
        "status": "Active",
        "client_type": "17",
        "pii": {
            "name": "Carlos Garcia Test",
            "phone": "+525512345678",
            "email": `carlos_pdf_${Date.now()}@test.com`,
            "rfc": "XAXX010101000" 
        }
    };

    try {
        console.log("--- TEST PDF STRUCTURE: /private/clients ---");
        // Según el PDF el endpoint es /clients bajo /private
        const res = await dynamicore.request('POST', '/clients', payload);
        console.log("Success:", JSON.stringify(res));
    } catch (e) {
        console.error("Failed:", e.response?.status, JSON.stringify(e.response?.data));
    }
}

test();
