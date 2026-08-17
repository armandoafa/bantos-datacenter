# Reporte de Auditoría y Análisis: Datos Históricos de Trustonic

Este reporte analiza el volumen y la distribución de los **343,386 dispositivos** importados a la base de datos de producción como carga inicial, categorizándolos por Tenant, Estados de Operación, Marcas Predominantes y Crecimiento Histórico desde el año 2021 al 2026.

---

## 📈 1. Distribución y Volumen General de Dispositivos por Tenant

La base de datos contiene dispositivos clasificados en **32 subtenants** (tenants administrados por Bantos como proveedor multi-tenant). Los principales son:

| Tenant ID | Total Dispositivos | Marcas Registradas | Estado Predominante |
| :--- | :---: | :---: | :--- |
| **alo** | 82,313 | 12 | `9. Bloqueado` (58,898) y `1. Activo` (4,029) |
| **bantos-msp** (Consolidado) | 48,206 | 1 | `1. FINANCIADO` (30,202) y `6. BLOQUEADO` (14,512) |
| **microtec** | 64,232 | - | `1 Financed` / Activo |
| **alamodigital** | 47,951 | - | `1. FINANCIADO` (28,802) y `6. BLOQUEADO` (16,058) |
| **bantos-prod** | 19,388 | 6 | `Active` (15,625) y `Locked` (2,853) |
| **credigold** | 4,971 | 1 | `1. FINANCIADO` (4,971) |
| **paguishop** | 814 | 1 | `Active` (814) |
| **credimasbcs-prod** | 779 | 1 | `Active` (779) |
| **wewow-prod** | 653 | 1 | `Active` (653) |

---

## 🏷️ 2. Top Marcas de Dispositivos por Tenant

El volumen de marcas nos permite identificar qué fabricantes dominan la cartera de cada cliente financiero:

### Tenant: `alo`
*   **Xiaomi**: 22,690 dispositivos
*   **Infinix**: 17,297 dispositivos
*   **Tecno**: 15,746 dispositivos
*   **Motorola**: 9,869 dispositivos
*   **Honor**: 7,896 dispositivos
*   **OPPO**: 6,253 dispositivos

### Tenant: `bantos-prod`
*   **Motorola**: 10,206 dispositivos
*   **Xiaomi**: 5,276 dispositivos
*   **Honor**: 3,874 dispositivos

---

## 🛠️ 3. Clasificación de Operaciones y Políticas Aplicadas

Las operaciones históricas de cambio de estado se clasifican principalmente según las reglas de negocio aplicadas a los dispositivos en Trustonic:

*   **Bloqueos Financieros (`Policy: 9. Bloqueado` / `6. BLOQUEADO`)**: Representa la acción de restricción por falta de pago. Suman más de **95,000 registros** a lo largo de la historia.
*   **Liberaciones Definitivas (`Policy: Liberar` / `Release` / `7. Released`)**: Dispositivos completamente liquidados y liberados de la plataforma de cobro. Suma alrededor de **13,800 dispositivos**.
*   **Advertencias y Notificaciones Pre-Bloqueo (`Policy: Siete días antes`, `Tres días antes`, etc.)**: Políticas visuales para incitar al cobro preventivo en pantalla. Suman **18,500 registros** en carteras activas como `alo` y `alamodigital`.

---

## 📅 4. Curva de Crecimiento Histórico de Operaciones (2021 - 2026)

El crecimiento del ecosistema Trustonic administrado por Bantos muestra una aceleración exponencial año tras año:

### Tenant: `microtec`
*   **2022**: Inicia con **7** registros mensuales en Febrero, cerrando el año con **485** registros en Diciembre. (Total 2022: ~1,800)
*   **2023**: Mantiene un promedio de **850** registros mensuales.
*   **2024 - 2025**: Mantiene un promedio de **800** activaciones/actualizaciones mensuales.
*   **Julio 2026**: Pico masivo de consolidación con **29,396** actualizaciones.

### Tenant: `alo`
*   **2024**: Inicia con un promedio de **250** dispositivos activos mensuales.
*   **2025**: Salto exponencial en Septiembre subiendo a **5,391** registros mensuales.
*   **Julio 2026**: Aceleración masiva registrando **202,472** eventos en el mes.

### Tenant: `alamodigital`
*   **2022**: Promedio de **95** registros mensuales.
*   **2023 - 2024**: Promedio de **500** registros mensuales.
*   **Julio 2026**: Registro masivo de **10,793** eventos en el consolidado final.

---

> [!NOTE]
> Todos estos datos analíticos ya se encuentran persistidos de forma segura en las tablas `trustonic_devices` y `trustonic_logs`. Esta carga inicial permite generar reportes históricos y gráficas de crecimiento de manera inmediata en la interfaz de **InSight** sin degradar el rendimiento del servidor en consultas futuras.
