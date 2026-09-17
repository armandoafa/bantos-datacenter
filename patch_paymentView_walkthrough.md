# Bloqueo Temporal de Pagos (Backend)

Se han implementado con éxito los bloqueos a nivel de servidor (Backend) para evitar que cualquier intento de pago proveniente de una aplicación con el frontend cacheado pueda procesarse.

## Resumen de Cambios

1. **Intercepción de Peticiones:** Se modificaron los endpoints de pago con tarjeta en el servidor (`server/src/index.js`):
   - `POST /api/webview/card-payments/create-customer`
   - `POST /api/webview/card-payments/assign-card`
   - `POST /api/webview/card-payments/transactions`
2. **Respuesta Forzada:** Todos estos endpoints ahora retornan automáticamente el siguiente error, sin ejecutar ninguna lógica interna ni comunicarse con Dynamicore:
   ```json
   { 
     "success": false, 
     "message": "El proceso de pago se encuentra en construcción. Por favor, intenta más tarde." 
   }
   ```
3. **Control de Versiones:** Los cambios fueron versionados y subidos al repositorio principal de GitHub.
4. **Despliegue (VPS):** Se sincronizó el repositorio en el servidor de producción (VPS Hostinger) y se reinició el gestor de procesos `pm2` para que la nueva lógica entre en vigor inmediatamente.

## ¿Qué verán los usuarios con caché?

Cualquier usuario cuya App Android aún no haya descartado la caché antigua (donde se puede visualizar el formulario de datos):
1. Podrá rellenar sus datos libremente.
2. Al dar clic en "Registrar y continuar", **verá aparecer inmediatamente un aviso rojo de error** debajo del título, indicando textualmente que el proceso se encuentra en construcción.
3. No se realizará ningún cargo a su tarjeta ni se creará un cliente ficticio, salvaguardando la integridad del proceso.

> [!NOTE]
> Recuerda remover estas 3 líneas de código en cada endpoint del archivo `server/src/index.js` una vez que estén listos para reanudar el flujo de cobros de manera oficial.
