import { useState, useEffect } from 'react';
import { CreditCard, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function PaymentCardForm({ amount, clientId }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDates, setRecurringDates] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // NOTE: En un entorno de producción, las llaves deben venir de una configuración central o variables de entorno.
  const dynamicorePublicKey = import.meta.env.VITE_DYNAMICORE_PUBLIC_KEY || 'REEMPLAZAR_PUBLIC_KEY';
  const dynamicoreKeyId = import.meta.env.VITE_DYNAMICORE_KEY_ID || 'REEMPLAZAR_KEY_ID';

  useEffect(() => {
    // Evitar que el SDK reviente si las llaves no están configuradas correctamente
    if (!dynamicorePublicKey || dynamicorePublicKey.includes('REEMPLAZAR')) {
      console.warn("Faltan las credenciales de Dynamicore (PUBLIC_KEY o KEY_ID) en las variables de entorno.");
      setError('Faltan las credenciales del procesador de pagos. Configura el archivo .env.');
      return;
    }

    // Configuración global requerida por el SDK de Dynamicore
    window.config = {
      targetIFrame: 'dynamicore-iframe',
      keyId: dynamicoreKeyId,
      publicKey: dynamicorePublicKey,
    };

    // Inyectar el script del SDK dinámicamente DESPUÉS de definir config
    const script = document.createElement('script');
    script.src = 'https://d132t6c8viujz9.cloudfront.net';
    script.async = true;
    document.head.appendChild(script);
    
    // Anular window.alert globalmente y dentro del iframe para silenciar alertas emergentes
    const originalAlert = window.alert;
    window.alert = function(msg) {
      if (typeof msg === 'string' && msg.includes('TOKEN:')) {
        const match = msg.match(/TOKEN:\s*([a-zA-Z0-9-]+)/);
        if (match) {
          processPayment(match[1]);
        }
        return; // Silenciar la alerta
      }
      return originalAlert.apply(this, arguments);
    };

    // Escuchar el evento de tokenización (mensaje desde el iframe de Dynamicore)
    const handleMessage = async (event) => {
      console.log('📨 [DEBUG] Recibido mensaje window.message:', event.data);
      if (!event.data) return;

      let tokenId = null;

      if (typeof event.data === 'object' && event.data.type === 'DYNAMICORE_TOKEN') {
        tokenId = event.data.token_id || event.data.token;
        console.log('✅ [DEBUG] Token extraído desde objeto DYNAMICORE_TOKEN:', tokenId);
      } else if (typeof event.data === 'string' && event.data.includes('TOKEN:')) {
        const match = event.data.match(/TOKEN:\s*([a-zA-Z0-9-]+)/);
        if (match) {
          tokenId = match[1];
          console.log('✅ [DEBUG] Token extraído desde string regex:', tokenId);
        }
      }

      if (tokenId) {
        processPayment(tokenId);
      } else {
        console.warn('⚠️ [DEBUG] No se encontró tokenId en el mensaje.');
      }
    };

    // Intentar silenciar alert() dentro del iframe cuando cargue
    const silenceIframeAlert = () => {
      try {
        const iframe = document.getElementById('dynamicore-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.alert = window.alert;
        }
      } catch (err) {
        // Ignorar si hay restricción de origen diferente
      }
    };
    const interval = setInterval(silenceIframeAlert, 500);
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      clearInterval(interval);
      window.alert = originalAlert;
      window.removeEventListener('message', handleMessage);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.config;
    };
  }, [dynamicoreKeyId, dynamicorePublicKey]);

  const processPayment = async (tokenId) => {
    try {
      setLoading(true);
      setError(null);
      console.group('💸 [DEBUG] processPayment (Backend Flow)');
      console.log('Token ID recibido:', tokenId);
      
      const baseURL = import.meta.env.VITE_API_URL || 'https://bantos.cloud/datacenter-api/webview';

      // 1. Asignar tarjeta al cliente
      const assignPayload = { customer_id: clientId, token_id: tokenId };
      console.log('➡️ [REQ 1] POST /card-payments/assign-card | Payload:', assignPayload);
      const res1 = await axios.post(`${baseURL}/card-payments/assign-card`, assignPayload);
      console.log('⬅️ [RES 1] Status:', res1.status, '| Data:', res1.data);

      // 2. Procesar el cargo
      const transPayload = { customer_id: clientId, payment_method: tokenId, amount: parseFloat(amount) };
      console.log('➡️ [REQ 2] POST /card-payments/transactions | Payload:', transPayload);
      const res2 = await axios.post(`${baseURL}/card-payments/transactions`, transPayload);
      console.log('⬅️ [RES 2] Status:', res2.status, '| Data:', res2.data);

      // 3. (Opcional) Guardar preferencia de domiciliación si lo solicitó
      if (isRecurring) {
        const parsedDates = recurringDates.split(',').map(s => parseInt(s.trim())).filter(d => !isNaN(d) && d > 0 && d <= 31);
        const subPayload = {
          customer_id: clientId,
          payment_method: tokenId,
          recurring_dates: parsedDates.length > 0 ? parsedDates : [new Date().getDate()]
        };
        console.log('➡️ [REQ 3] POST /card-payments/subscriptions | Payload:', subPayload);
        const res3 = await axios.post(`${baseURL}/card-payments/subscriptions`, subPayload);
        console.log('⬅️ [RES 3] Status:', res3.status, '| Data:', res3.data);
      } else {
        console.log('ℹ️ [DEBUG] Suscripción omitida (isRecurring = false)');
      }

      console.groupEnd();
      setSuccess(true);
    } catch (err) {
      console.groupEnd();
      console.error('❌ [DEBUG] Error procesando pago:', err);
      if (err.response) {
        console.error('Data del backend:', err.response.data);
        console.error('Status:', err.response.status);
      } else if (err.request) {
        console.error('Request no tuvo respuesta:', err.request);
      }
      setError('Hubo un error al procesar tu pago. Verifica los fondos o intenta con otra tarjeta.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenize = () => {
    setLoading(true);
    setError(null);
    console.log('🚀 [DEBUG] Iniciando proceso de tokenización (handleTokenize)...');
    
    const iframe = document.getElementById('dynamicore-iframe');
    
    if (window.DynamicoreHelper && typeof window.DynamicoreHelper.submit === 'function') {
      console.log('✅ [DEBUG] Ejecutando window.DynamicoreHelper.submit()...');
      window.DynamicoreHelper.submit();
    } else if (iframe && iframe.contentWindow) {
      console.log('✅ [DEBUG] Ejecutando postMessage con SUBMIT_FORM al iframe...');
      // Disparar mensaje directo de submit al iframe de Dynamipay
      iframe.contentWindow.postMessage({ type: 'SUBMIT_FORM', action: 'tokenize' }, '*');
    } else {
      console.warn('⚠️ [DEBUG] No se pudo encontrar DynamicoreHelper ni un iframe válido.');
      setTimeout(() => {
        setError('No se pudo conectar con el formulario de pagos. Por favor intenta de nuevo.');
        setLoading(false);
      }, 1000);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">¡Pago Exitoso!</h3>
        <p className="text-gray-500 mt-2">Tu transacción por ${amount} MXN ha sido aprobada.</p>
        {isRecurring && (
          <p className="text-sm text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-full">
            Domiciliación activada correctamente
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamicore Iframe Container */}
      <div className="border border-gray-200 rounded-2xl bg-white shadow-sm" style={{ overflow: 'hidden', height: '430px' }}>
        <iframe 
          id="dynamicore-iframe" 
          title="Pago Seguro Dynamicore"
          style={{ 
            width: '800px', 
            height: '500px',
            border: 'none',
            display: 'block',
            transform: 'translateX(-140px) translateY(-70px)',
          }}
        ></iframe>
      </div>

      <div className="flex justify-center items-center space-x-2 text-xs text-gray-400 mt-2">
        <Lock className="w-3 h-3" />
        <span>Tus datos están encriptados y protegidos por Dynamicore</span>
      </div>
    </div>
  );
}
