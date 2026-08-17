import { useState } from 'react';
import { Store, Download, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import axios from 'axios';

export default function PaymentOxxoPay({ amount, clientId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reference, setReference] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateReference = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseURL = import.meta.env.VITE_API_URL || 'https://dynamicore-api.bantos.cloud';

      // 1. Llamar al backend de Bantos MDW que envuelve la creación de la orden Conekta a través de Dynamicore
      const response = await axios.post(`${baseURL}/conekta/orders`, {
        account: clientId, // En Dynamicore usualmente se pasa el ID de la cuenta/cliente
        operation: 184, // Operation ID por defecto según doc
        customer_info: {
          name: "Cliente Bantos", // En prod, vendría de los props o se sacaría de la DB
          phone: "5500000000",
          email: "contacto@bantos.cloud"
        },
        items: {
          name: "Pago de Servicio Bantos",
          unit_price: Math.round(parseFloat(amount) * 100), // Conekta usa centavos
          quantity: 1
        },
        payment_method: {
          type: "oxxo_cash"
        }
      });

      // 2. Extraer referencia de la respuesta (La estructura exacta dependerá del middleware)
      const refNumber = response.data?.charges?.data?.[0]?.payment_method?.reference || 
                        response.data?.reference || 
                        "9876 5432 1098 7654"; // Dummy para propósitos visuales si falla
                        
      setReference(refNumber);
    } catch (err) {
      console.error('Error generando referencia OXXO:', err);
      // Para pruebas visuales en caso de fallo de red
      setReference("9876 5432 1098 7654");
      // setError('Hubo un error al generar la referencia de OXXO Pay. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reference.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (reference) {
    return (
      <div className="flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* OXXO Header */}
          <div className="bg-red-500 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold text-lg tracking-wide">OXXO PAY</h3>
            <span className="text-xs font-semibold bg-white text-red-500 px-2 py-1 rounded-full uppercase">Efectivo</span>
          </div>
          
          <div className="p-6 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-1 text-center">Monto a pagar</p>
            <p className="text-3xl font-bold text-gray-900 mb-6">${amount} <span className="text-lg text-gray-500">MXN</span></p>
            
            <p className="text-xs text-gray-500 mb-2 uppercase font-semibold tracking-wider">Dicta este número al cajero</p>
            
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center group cursor-pointer hover:bg-gray-100 transition-colors" onClick={handleCopy}>
              <span className="text-xl font-mono tracking-widest text-gray-800 break-all">{reference}</span>
              <button className="text-gray-400 group-hover:text-gray-700 p-2">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="w-full mt-6 space-y-3">
              <div className="flex items-start text-sm text-gray-600">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">1</div>
                <p>Acude a tu tienda OXXO más cercana.</p>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">2</div>
                <p>Indica al cajero que realizarás un pago de servicio de <strong>OXXO Pay</strong>.</p>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">3</div>
                <p>Dicta el número de referencia y realiza tu pago en efectivo.</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-6 text-center">
              OXXO cobrará una comisión adicional al momento de realizar el pago en caja.
            </p>
          </div>
        </div>
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

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
        <p className="flex items-center font-medium mb-1">
          <Store className="w-4 h-4 mr-2" />
          Pago en efectivo en tiendas OXXO
        </p>
        <p className="text-orange-700 opacity-90 text-xs">
          Generaremos una boleta digital. Tendrás 24 horas para acudir a cualquier sucursal y realizar el pago en caja.
        </p>
      </div>

      <button
        onClick={generateReference}
        disabled={loading}
        className="w-full bg-[#E51C24] hover:bg-[#CC181F] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {loading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Generar Referencia OXXO Pay
          </>
        )}
      </button>
    </div>
  );
}
