import mysql from 'mysql2/promise';
import * as xlsx from 'xlsx';
import pool from '../config/db.js';
import { TrustonicClient } from '../../modules/trustonic-api-client/index.js';

const API_KEY = 'qjF+s7/rxVffo3Fnzm20PdIlFGDDpYOredEsRvl3wYYUAh2vhnmeHoQuUQNkKdoyOQCQN6oDcAZ7166n59orHQ==';
const client = new TrustonicClient(API_KEY);

const OUTPUT_FILE = '/var/www/bantos.cloud/bantos-datacenter/Reporte_Trustonic_c-romel.xlsx';

async function run() {
    console.log("Iniciando generación de reporte Trustonic para C-Romel...");

    try {
        console.log("Consultando base de datos para extraer todos los IMEIs...");
        // Extraer absolutamente todos los IMEIs relacionados a c-romel
        const [rows] = await pool.query(`
            SELECT DISTINCT imei FROM (
                SELECT serial_number as imei FROM inventory WHERE tenant_id = 'c-romel' AND serial_number IS NOT NULL AND serial_number != ''
                UNION
                SELECT imei1 as imei FROM trustonic_devices WHERE tenant_id = 'c-romel' AND imei1 IS NOT NULL AND imei1 != ''
            ) as all_imeis
        `);

        console.log(`Se encontraron ${rows.length} IMEIs únicos del lado de Bantos.`);
        if (rows.length === 0) {
            console.log("No hay datos para procesar. Saliendo.");
            process.exit(0);
        }

        const imeisArray = rows.map(r => r.imei);
        const reportData = [];
        
        // Procesar en lotes de 50 
        const BATCH_SIZE = 50;
        for (let i = 0; i < imeisArray.length; i += BATCH_SIZE) {
            const batch = imeisArray.slice(i, i + BATCH_SIZE);
            console.log(`Consultando lote de ${batch.length} dispositivos (Progreso: ${i + batch.length}/${imeisArray.length})...`);
            
            try {
                // Llama al POST /api/v2/query/devices 
                const response = await client.query.getDeviceInfo(batch);
                
                if (response && response.deviceResponseList) {
                    for (const dev of response.deviceResponseList) {
                        // Aquí volcamos absolutamente todas las columnas (keys) que responda Trustonic
                        reportData.push(dev);
                    }
                }
            } catch (err) {
                console.error(`Error consultando el lote: ${err.message}`);
                batch.forEach(imei => {
                    reportData.push({ deviceUid: imei, error: 'Fallo al consultar Trustonic API' });
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("Generando archivo Excel...");
        const wb = xlsx.utils.book_new();
        // xlsx genera automáticamente las columnas a partir de las propiedades del objeto (todas las columnas de Trustonic)
        const ws = xlsx.utils.json_to_sheet(reportData);
        xlsx.utils.book_append_sheet(wb, ws, "Reporte Trustonic");

        xlsx.writeFile(wb, OUTPUT_FILE);
        console.log(`¡Reporte generado exitosamente en: ${OUTPUT_FILE}!`);

    } catch (error) {
        console.error("Ocurrió un error fatal:", error);
    } finally {
        pool.end();
        process.exit(0);
    }
}

run();
