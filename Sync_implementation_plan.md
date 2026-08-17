# Plan de Implementación: Solución Definitiva a Sincronizaciones Masivas (Error 504)

El error `504 Gateway Time-out` que sigues viendo probablemente no lo está generando Nginx (al cual ya le dimos 10 minutos), sino que existe una capa superior (como **Cloudflare** o el propio **Axios** en tu navegador) que tiene un límite estricto inamovible (Cloudflare corta cualquier petición HTTP que dure más de 100 segundos, por ejemplo).

Además, sobre tu preocupación de los duplicados: **No se están duplicando registros**. La base de datos de Bantos tiene llaves únicas (`UNIQUE KEY`) para cada ID de Upya, por lo que el `ON DUPLICATE KEY UPDATE` garantiza que si la sincronización falla a la mitad y se vuelve a correr, los que ya estaban solo se actualizarán y los nuevos se insertarán.

Dado que la primera sincronización de TecMobile es masiva y rebasa los límites de tiempo HTTP convencionales, propongo las siguientes dos rutas de acción:

## Opción A: Refactorización a "Proceso en Segundo Plano" (Recomendada para el futuro)
Modificaremos la arquitectura del endpoint `/api/sync/bootstrap`:
1. El frontend envía la petición de sincronizar.
2. El backend responde inmediatamente con un `200 OK: Sincronización iniciada en segundo plano` (toma 1 segundo).
3. El backend continúa descargando e insertando la data masiva de Upya sin depender de que el navegador mantenga la conexión abierta.
4. (Opcional) Podemos agregar un endpoint de "Estado de Sincronización" para que la UI sepa cuándo terminó.

## Opción B: Ejecución Manual en Servidor (Rápida y de una sola vez)
Si el objetivo es simplemente traerse la base de datos de TecMobile **una sola vez** para operar desde Bantos, no necesitamos reconstruir la aplicación web.
1. Puedo crear un script en el servidor (`sync-tecmobile.js`).
2. Lo ejecuto directamente por la terminal del VPS.
3. Al correr por consola, **no existe Nginx ni Cloudflare**, por lo que no hay límites de tiempo. Puede tardar 30 minutos sin interrupciones.

> [!IMPORTANT]
> **User Review Required**
> 
> ¿Qué ruta prefieres tomar? 
> - Si eliges la **Opción A**, haré cambios en el código de React y Node para volver asíncrono el botón de sincronizar.
> - Si eliges la **Opción B**, correré el proceso masivo manualmente desde aquí por la terminal para que tengas tus datos listos hoy mismo sin tocar el código actual.
