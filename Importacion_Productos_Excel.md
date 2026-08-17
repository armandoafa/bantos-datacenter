# 📦 Importación de Productos desde Excel — Guía Técnica Detallada

**Plataforma:** Bantos DataCenter  
**Módulo:** Productos > Importador Inteligente de Excel  
**Versión:** 1.1  
**Fecha:** Julio 2026

---

## Índice

1. [Descripción General](#1-descripción-general)
2. [Prerrequisitos](#2-prerrequisitos)
3. [Estructura del Archivo Excel](#3-estructura-del-archivo-excel)
4. [Flujo de Importación Paso a Paso](#4-flujo-de-importación-paso-a-paso)
5. [Algoritmo de Auto-Matching de Columnas](#5-algoritmo-de-auto-matching-de-columnas)
6. [Modelo de Datos y Tablas Impactadas](#6-modelo-de-datos-y-tablas-impactadas)
7. [Procesamiento en el Backend](#7-procesamiento-en-el-backend)
8. [Manejo de Duplicados (UPSERT)](#8-manejo-de-duplicados-upsert)
9. [Registro de Auditoría](#9-registro-de-auditoría)
10. [Errores Comunes y Soluciones](#10-errores-comunes-y-soluciones)
11. [Ejemplo de Archivo Excel Compatible](#11-ejemplo-de-archivo-excel-compatible)

---

## 1. Descripción General

El **Importador Inteligente de Excel** es una funcionalidad del módulo de **Productos** en Bantos DataCenter que permite cargar de forma masiva catálogos de dispositivos y existencias desde archivos `.xlsx`, `.xls` o `.csv`.

El proceso es **multi-tenant**: todos los datos importados quedan estrictamente asociados al tenant activo del usuario autenticado, garantizando aislamiento total entre organizaciones.

### ¿Qué datos puede importar?

| Entidad | Descripción | Tabla en BD |
|---|---|---|
| **Productos** | Catálogo: Nombre, Modelo, Variante, Marca, Categoría, Precio | `products` |
| **Inventario** | Números de serie (S/N) individuales | `inventory` |
| **Dispositivos** | Identificadores IMEI 1 e IMEI 2 | `trustonic_devices` |

Una sola fila del Excel puede alimentar las tres tablas simultáneamente si contiene los campos correspondientes.

---

## 2. Prerrequisitos

- Tener una sesión activa en Bantos DataCenter con un **tenant asignado**.
- Disponer de un archivo en formato **`.xlsx`**, **`.xls`** o **`.csv`**.
- El archivo debe contener al menos una de las siguientes columnas identificadoras: **Nombre del producto**, **IMEI** o **Número de Serie**.
- Acceso al módulo **Productos** en el menú lateral (sección *Estructura*).

---

## 3. Estructura del Archivo Excel

El importador acepta cualquier estructura de columnas. No existe un formato obligatorio fijo, ya que el sistema mapea las columnas de tu archivo a los campos de Bantos mediante un algoritmo de auto-detección.

### Campos que el sistema reconoce y su equivalencia

| Campo Bantos | Descripción | Palabras clave detectadas automáticamente |
|---|---|---|
| **Nombre** *(requerido)* | Nombre visible del producto | `nombre`, `producto`, `modelo`, `device`, `description`, `descripción`, `item` |
| **Modelo** | Modelo técnico agrupador (e.g., Galaxy S24) | `model`, `modelo base`, `familia`, `linea`, `device model` |
| **Variante** | Especificaciones de RAM, almacenamiento o color | `variante`, `variant`, `version`, `versión`, `color`, `ram`, `storage`, `almacenamiento`, `capacidad` |
| **Referencia / SKU** | Código interno o referencia de proveedor | `referencia`, `sku`, `código`, `codigo`, `ref`, `part`, `id` |
| **Categoría** | Tipo de producto | `categoría`, `categoria`, `tipo`, `grupo`, `category` |
| **Marca / Fabricante** | Empresa fabricante | `marca`, `fabricante`, `vendor`, `brand`, `make` |
| **Precio Base** | Costo o precio de venta | `precio`, `costo`, `valor`, `monto`, `price`, `cost` |
| **Número de Serie** | S/N del dispositivo físico | `serie`, `sn`, `serial`, `numero de serie`, `s/n`, `nro serie` |
| **IMEI 1** | Identificador primario del modem | `imei`, `imei1`, `imei 1`, `celular imei` |
| **IMEI 2** | Identificador secundario (Dual SIM) | `imei2`, `imei 2`, `segundo imei` |

> [!NOTE]
> La detección de columnas es **case-insensitive** y usa coincidencia parcial. Por ejemplo, una columna llamada `"Variante de color"` será reconocida automáticamente como el campo **Variante**.

---

## 4. Flujo de Importación Paso a Paso

El importador funciona como un **asistente de 4 pasos**:

```mermaid
flowchart LR
    A["📂 Paso 1\nSubir Archivo"] --> B["🔗 Paso 2\nMapeo de Columnas"]
    B --> C["👁️ Paso 3\nVista Previa"]
    C --> D["✅ Paso 4\nResultado"]
```

### Paso 1 — Subir el Archivo

1. Navega al módulo **Productos** desde el menú lateral.
2. Haz clic en el botón verde **"Importar Excel"** (ícono de hoja de cálculo).
3. Arrastra tu archivo `.xlsx` / `.xls` / `.csv` al área marcada, o haz clic en **"Seleccionar Archivo"**.
4. El sistema carga automáticamente el motor de lectura **SheetJS** desde CDN y procesa el archivo en el navegador, sin enviar datos al servidor en este paso.

**Procesamiento del archivo:**
```
Archivo .xlsx  ──►  FileReader (binario)  ──►  SheetJS XLSX.read()
                                              ──►  XLSX.utils.sheet_to_json()
                                              ──►  Detección de cabeceras
                                              ──►  Auto-Matching
```

### Paso 2 — Mapeo de Columnas

El sistema muestra un panel de **10 campos de destino** de Bantos, cada uno con un selector desplegable que lista las columnas detectadas en tu Excel.

- Las columnas que el **auto-matching** detectó aparecerán pre-seleccionadas con la etiqueta ✅ **Detectado**.
- Puedes **corregir manualmente** cualquier mapeo usando los desplegables.
- Los campos que no tengan equivalente en tu archivo pueden dejarse en **"— Ignorar este campo —"**.

> [!IMPORTANT]
> Al menos uno de los siguientes campos debe estar mapeado para que una fila sea válida: **Nombre**, **IMEI 1** o **Número de Serie**.

### Paso 3 — Vista Previa

Antes de confirmar, el sistema muestra una tabla con los **primeros 5 registros transformados** según el mapeo definido. Esto permite verificar que los datos se interpretan correctamente.

Se muestran: `Nombre`, `Modelo`, `Variante`, `Referencia`, `Marca`, `Precio`, `IMEI 1 / Serie`.

Si el total supera 5 registros, se indica cuántos más serán procesados.

### Paso 4 — Resultado

Al confirmar la importación, el sistema muestra un resumen con:

| Estadística | Descripción |
|---|---|
| **Productos** | Registros insertados/actualizados en el catálogo |
| **IMEIs** | Dispositivos registrados en `trustonic_devices` |
| **Series** | Unidades de inventario registradas en `inventory` |

---

## 5. Algoritmo de Auto-Matching de Columnas

El algoritmo busca coincidencias entre los **encabezados del Excel** y las **palabras clave** de cada campo Bantos:

```javascript
// Pseudocódigo del algoritmo
targetFields.forEach(field => {
  const match = detectedHeaders.find(header => {
    const normalized = header.toLowerCase().trim();
    return field.keywords.some(keyword => normalized.includes(keyword));
  });
  initialMapping[field.key] = match || ''; // '' = ignorar
});
```

**Ejemplo de detección:**

| Encabezado en Excel | Campo Detectado | Razón |
|---|---|---|
| `Nombre del Equipo` | Nombre del Producto | Contiene `"nombre"` |
| `Device Model` | Modelo | Contiene `"model"` |
| `Color y Capacidad` | Variante | Contiene `"color"`, `"capacidad"` |
| `IMEI Primary` | IMEI 1 | Contiene `"imei"` |
| `S/N Dispositivo` | Número de Serie | Contiene `"s/n"` |
| `Brand` | Marca / Fabricante | Coincide con `"brand"` |
| `Precio Venta` | Precio / Costo Base | Contiene `"precio"` |

---

## 6. Modelo de Datos y Tablas Impactadas

### Tabla `products` — Catálogo de Modelos

```sql
INSERT INTO products (
  upya_id, tenant_id, name, model, variant, category, reference,
  is_lockable, manufacturer, is_serialized, description,
  status, base_value
)
VALUES (
  'IMPORT-{ref}', '{tenantId}', '{name}', '{model}', '{variant}', '{category}',
  '{reference}', 0, '{manufacturer}', {0|1},
  'Importado vía Excel', 'Active', {base_value}
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  model = VALUES(model),
  variant = VALUES(variant),
  category = VALUES(category),
  manufacturer = VALUES(manufacturer),
  base_value = VALUES(base_value);
```

**Notas:**
- `upya_id` se genera como `IMPORT-{referencia}` o `PROD-{timestamp}` si no hay referencia.
- `is_serialized` se activa automáticamente si la fila contiene `serial_number` o `imei1`.

### Tabla `inventory` — Inventario de Series

Se inserta **únicamente si la fila contiene `serial_number`**:

```sql
INSERT INTO inventory (upya_id, serial_number, tenant_id, model, status)
VALUES ('INV-{serial}', '{serial}', '{tenantId}', '{productName}', 'In Stock')
ON DUPLICATE KEY UPDATE
  model = VALUES(model),
  status = VALUES(status);
```

### Tabla `trustonic_devices` — Registro de IMEIs

Se inserta **únicamente si la fila contiene `imei1`**:

```sql
INSERT INTO trustonic_devices (
  imei1, imei2, tenant_id, service, status, brand, model
)
VALUES (
  '{imei1}', '{imei2|NULL}', '{tenantId}',
  'Prepago', 'Listo para su uso', '{manufacturer}', '{productName}'
)
ON DUPLICATE KEY UPDATE
  brand = VALUES(brand),
  model = VALUES(model);
```

---

## 7. Procesamiento en el Backend

### Endpoint

```
POST /api/backoffice/products/import-batch
```

### Cuerpo de la solicitud

```json
{
  "username": "armando.afa",
  "tenantId": "bantoshub",
  "items": [
    {
      "name": "Samsung Galaxy S24 FE Amarillo",
      "model": "Samsung Galaxy S24 FE",
      "variant": "8GB RAM / 256GB / Amarillo",
      "reference": "SM-S921",
      "category": "Smartphone",
      "manufacturer": "Samsung",
      "base_value": 14999.00,
      "serial_number": "RZ8N30WXYZ1",
      "imei1": "352099001234567",
      "imei2": "352099007654321"
    }
  ]
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "products": 1,
  "devices": 1,
  "inventory": 1
}
```

---

## 8. Manejo de Duplicados (UPSERT)

El sistema utiliza la instrucción **`ON DUPLICATE KEY UPDATE`** para prevenir redundancia de datos.

1. Si el producto (`upya_id`, `tenant_id`) ya existe: se actualizan sus metadatos (nombre, modelo, variante, categoría, marca, precio) con la información del Excel.
2. Si el número de serie (`serial_number`, `tenant_id`) ya está registrado en `inventory`: se actualiza su modelo.
3. Si el dispositivo (`imei1`) ya existe en `trustonic_devices`: se actualiza su marca y modelo.

---

## 9. Registro de Auditoría

Cada operación de importación masiva genera una entrada en la tabla `operation_logs`:

- **Usuario:** El username de quien subió el archivo.
- **Tenant:** El tenant_id del contexto actual.
- **Tipo de Proceso:** `PRODUCT_BATCH_IMPORT`
- **ID Proceso:** `BATCH-{timestamp}`
- **Detalle:** Un JSON con el recuento final de filas importadas y los metadatos.
- **Estatus:** `SUCCESS` o `ERROR`.

---

## 10. Errores Comunes y Soluciones

| Error Detectado | Causa Probable | Solución |
|---|---|---|
| **La pantalla se congela** | El archivo tiene más de 10,000 filas y agota el heap de Javascript. | Divide el archivo en partes de máximo 2,000 a 3,000 registros. |
| **No se auto-mapea la variante** | La columna en Excel tiene un nombre atípico (e.g. "Cap. Almacenamiento"). | Mapea manualmente usando la interfaz o añade la palabra clave al diccionario del código. |
| **Error 500 al guardar** | El `tenantId` está vacío o la base de datos de producción no tiene la versión del esquema actualizada. | Asegúrate de tener una sesión activa. Contacta al administrador para verificar que la tabla `products` cuente con los campos `model` y `variant`. |

---

## 11. Ejemplo de Archivo Excel Compatible

Puedes utilizar esta estructura en tu archivo Excel para una importación completa y óptima:

| Nombre del Equipo | Modelo | Variante | SKU | Fabricante | Precio | Serie | IMEI 1 | IMEI 2 |
|---|---|---|---|---|---|---|---|---|
| Samsung A55 128GB | Galaxy A55 | 8GB/128GB Azul | SM-A556 | Samsung | 8999 | RZ8N30WXYZ1 | 352099001234567 | 352099007654321 |
| Motorola G24 Gris | Moto G24 | 4GB/128GB Gris | XT-2423 | Motorola | 2999 | SE892011M | 359876008888999 | NULL |
