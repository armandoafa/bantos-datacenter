import { useState } from 'react';
import { Smartphone, Lock, RefreshCw, AlertCircle, Store } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function IdentificationScreen({ onValidated }) {
  const [imei, setImei] = useState('');
  const [company, setCompany] = useState('Bantos Tienda 1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!imei.trim()) {
      setError('Por favor ingresa tu Número de Celular o IMEI');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Endpoint del Bantos Express Server
      const endpoint = import.meta.env.VITE_BANTOS_API_URL || 'https://bantos.cloud/datacenter-api/webview/validate-device';
      
      const response = await axios.post(endpoint, { imei: imei.trim(), company });

      if (response.data.success) {
        // Pasamos los datos del contrato validado a la pantalla principal
        onValidated(response.data.data);
      } else {
        setError(response.data.message || 'El dispositivo no pudo ser validado.');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.response?.data?.message || 'Error de conexión al validar el dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in zoom-in duration-300 p-2">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
          <Smartphone className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Identificación</h2>
        <p className="text-sm text-gray-500 px-4">
          Para proceder con tu pago, por favor valida tu dispositivo registrado.
        </p>
      </div>

      <form onSubmit={handleValidate} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start text-sm border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase ml-1">
            Compañía / Empresa
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Store className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow shadow-sm appearance-none"
            >
              <option value="Bantos Tienda 1">Bantos Tienda 1</option>
              <option value="Bantos Tienda 2">Bantos Tienda 2</option>
              <option value="Otros">Otros</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase ml-1">
            IMEI del dispositivo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Smartphone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow shadow-sm"
              placeholder="Ej. 351940081234567"
              required
            />
          </div>
          <p className="text-[11px] text-gray-500 italic ml-1 mt-1">
            Puedes obtenerlo desde el menú de opciones de la aplicación.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !imei.trim()}
          className={clsx(
            "w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] mt-6",
            (loading || !imei.trim()) ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          )}
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            'Validar Dispositivo'
          )}
        </button>
      </form>
    </div>
  );
}
