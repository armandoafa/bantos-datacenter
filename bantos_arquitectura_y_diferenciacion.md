# Arquitectura y Diferenciación Tecnológica: Bantos DataCenter

Este documento detalla la arquitectura, patrones de diseño y decisiones de ingeniería implementadas en **Bantos DataCenter**, demostrando que la plataforma es una solución de *software* propietaria, independiente y omnicanal. Aunque la experiencia de usuario (UX) haya tomado inspiración de las interfaces de Upya, el desarrollo subyacente y las capacidades de gestión superan y se diferencian fundamentalmente de dicho ecosistema.

---

## 1. Independencia Tecnológica y UI/UX Propietaria

La interfaz de usuario (UI) de Bantos no es un "espejo" ni un clon de Upya, sino una **Single Page Application (SPA)** reescrita desde cero con tecnologías de vanguardia para soportar una operación omnicanal nativa:

*   **Stack Tecnológico Moderno:** Construido sobre React.js y Vite, utilizando TailwindCSS para un sistema de diseño responsivo y Framer Motion para micro-interacciones (animaciones de transición fluidas).
*   **Progressive Web App (PWA):** A diferencia de las interfaces tradicionales, Bantos implementa *Service Workers* (`workbox`). Esto permite que la plataforma cachee recursos estáticos, reduzca los tiempos de carga a casi cero y prepare el terreno para operaciones *offline-first* en dispositivos móviles.
*   **Enrutamiento por Máquina de Estados:** La navegación en Bantos no recarga la página. Utiliza un motor de estados (`activeTab` / `view`) que gestiona la memoria de la aplicación, garantizando que el cambio entre el "Dashboard", "Registro de Contratos" o "Inventario" sea instantáneo.

## 2. Gestión Multitenant y Jerarquía Organizacional

Una de las diferencias más grandes respecto a integraciones básicas es que Bantos posee su propio **motor Multitenant nativo**:

*   **Aislamiento de Datos (Row-Level Isolation):** La base de datos relacional de Bantos particiona la información mediante la llave `tenant_id`. Esto permite que Bantos hospede a múltiples empresas (ej. *Tecmobile*, *Bantoshub*) en la misma infraestructura, garantizando que los datos operativos, clientes y contratos jamás colisionen.
*   **Motor RBAC Dinámico (Control de Acceso Basado en Roles):** Se desarrolló un algoritmo propietario (`getScopeFilter`) que muta las consultas a la base de datos en tiempo real dependiendo de la jerarquía del usuario:
    *   **STAFF:** Visualización restringida únicamente a las acciones/ventas realizadas por el usuario.
    *   **MANAGER (Gerentes):** Utiliza consultas SQL recursivas (CTE) para mapear el árbol organizacional, permitiendo al gerente ver su operación y la de todas las sucursales subordinadas.
    *   **ADMIN:** Acceso global al *tenant*.
*   **Trazabilidad y Auditoría Propietaria:** Bantos lleva su propio registro inmutable (`operation_logs`) de quién inició sesión, quién modificó un producto o quién registró un contrato, algo vital para el control de fraude que opera de forma totalmente independiente a los logs de Upya.

## 3. Homologación y "Single Source of Truth" (Fuente Única de Verdad)

Bantos DataCenter trata a Upya (y a otros sistemas) como **proveedores de datos subordinados**, asumiendo el rol de "Fuente Única de Verdad" para las reglas de negocio de la empresa:

*   **Patrón Adaptador (Adapter Pattern):** Se programó un cliente (`UpyaManageClient`) que traduce el complejo lenguaje de la API de Upya a la estructura nativa de Bantos.
*   **Configuración Comercial Desligada:** Upya puede proveer el catálogo base de dispositivos, pero Bantos se apropia de la gestión comercial. En la UI propietaria, los administradores de Bantos configuran precios base, Tasas de IVA (para facturación y cálculos contables) y cargan fotografías de los productos. **Esta información comercial vive y es dueña exclusiva de Bantos.**
*   **Estrategia de Resiliencia (Fallback Scraper):** Si la comunicación oficial con la API de Upya falla (ej. *403 Access Denied*), Bantos posee un motor de raspado web (Scraper Automático) que extrae la información en segundo plano, garantizando la continuidad del negocio sin depender exclusivamente de los servidores de terceros.

## 4. Integraciones Omnicanal Exclusivas de Bantos

Bantos es un "Data Center" porque centraliza módulos que Upya no contempla o no integra para el ecosistema mexicano/latinoamericano:

*   **Procesamiento de Pagos Seguro (PCI-DSS):** Bantos integra su propio ecosistema de pagos dividido. Posee un portal externo (`payment-webview`) que inyecta Iframes seguros de pasarelas locales (Dynamicore/Conekta) para pagos con tarjeta y SPEI/OxxoPay, y un módulo interno para gestionar domiciliaciones (pagos recurrentes).
*   **Módulo de Seguridad (MDM Trustonic):** Bantos integra nativamente los endpoints para el bloqueo y desbloqueo de dispositivos financiados, actuando como un puente entre la venta del contrato y la protección del activo.
*   **Mensajería y Comunicaciones (Próximamente):** Arquitectura ya pre-diseñada para enlazarse con Webhooks, IOA AssistBridge y motores de WhatsApp, unificando la cobranza, el marketing y la gestión en un solo panel de control.

---

### Conclusión

El código fuente, la estructura de la base de datos y la interfaz de usuario demuestran que **Bantos DataCenter es un desarrollo original**. La plataforma no se limita a ser un visualizador de Upya, sino un ERP/CRM a medida que subordina múltiples orígenes de datos (Upya, Trustonic, Dynamicore) bajo sus propias reglas de negocio, esquemas de seguridad jerárquica y diseño centrado en el usuario.
