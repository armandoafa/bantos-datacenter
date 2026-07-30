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
      if (!event.data) return;

      let tokenId = null;

      if (typeof event.data === 'object' && event.data.type === 'DYNAMICORE_TOKEN') {
        tokenId = event.data.token_id || event.data.token;
      } else if (typeof event.data === 'string' && event.data.includes('TOKEN:')) {
        const match = event.data.match(/TOKEN:\s*([a-zA-Z0-9-]+)/);
        if (match) {
          tokenId = match[1];
        }
      }

      if (tokenId) {
        processPayment(tokenId);
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
      
      const baseURL = import.meta.env.VITE_API_URL || 'https://dynamicore-api.bantos.cloud';

      // 1. Asignar tarjeta al cliente
      await axios.post(`${baseURL}/card-payments/assign-card`, {
        customer_id: clientId,
        token_id: tokenId
      });

      // 2. Procesar el cargo
      await axios.post(`${baseURL}/card-payments/transactions`, {
        customer_id: clientId,
        payment_method: tokenId,
        amount: parseFloat(amount)
      });

      // 3. (Opcional) Guardar preferencia de domiciliación si lo solicitó
      if (isRecurring) {
        const parsedDates = recurringDates.split(',').map(s => parseInt(s.trim())).filter(d => !isNaN(d) && d > 0 && d <= 31);
        // Endpoint hipotético en nuestro middleware para activar domiciliación
        await axios.post(`${baseURL}/card-payments/subscriptions`, {
          customer_id: clientId,
          payment_method: tokenId,
          recurring_dates: parsedDates.length > 0 ? parsedDates : [new Date().getDate()]
        });
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error procesando pago:', err);
      setError('Hubo un error al procesar tu pago. Verifica los fondos o intenta con otra tarjeta.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenize = () => {
    setLoading(true);
    setError(null);
    // Disparar la orden de tokenización hacia el iframe
    // En la integración real de Dynamicore, se llama a una función inyectada por su SDK
    if (window.DynamicoreHelper && window.DynamicoreHelper.submit) {
      window.DynamicoreHelper.submit();
    } else {
      // Simulación para propósitos de UI si no está cargado
      setTimeout(() => {
        setError('El SDK de Dynamicore no se cargó correctamente. Contacta a soporte.');
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

      {/* Opciones de pago */}
      <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-3">
          <input 
            type="checkbox" 
            id="recurring" 
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
          />
          <label htmlFor="recurring" className="text-sm text-gray-700 flex flex-col cursor-pointer select-none">
            <span className="font-medium text-gray-900 flex items-center">
              Activar pago recurrente (Domiciliación)
              <RefreshCw className="w-3.5 h-3.5 ml-1.5 text-indigo-500" />
            </span>
            <span className="text-xs text-gray-500 mt-0.5">Autorizo realizar cargos automáticos mensuales</span>
          </label>
        </div>
        
        {isRecurring && (
          <div className="pl-8 pt-2 animate-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Días de cargo (1-31)</label>
            <input 
              type="text" 
              className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Ej. 15, 30 (Separados por coma)" 
              value={recurringDates} 
              onChange={(e) => setRecurringDates(e.target.value)} 
            />
            <p className="text-[10px] text-gray-400 mt-1">Si dejas esto en blanco, se cobrará el día {new Date().getDate()} de cada mes.</p>
          </div>
        )}
      </div>

      <button
        onClick={handleTokenize}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {loading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pagar ${amount} MXN de forma segura
          </>
        )}
      </button>

      <div className="flex justify-center items-center space-x-2 text-xs text-gray-400 mt-2">
        <Lock className="w-3 h-3" />
        <span>Tus datos están encriptados y protegidos por Dynamicore</span>
      </div>
    </div>
  );
}
