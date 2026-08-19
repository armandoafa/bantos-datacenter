import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Hash,
  RefreshCw, AlertCircle, ChevronDown, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

// Campos agrupados para el formulario del Paso 1 (Guía de Tokenización Dynamicore)
const INITIAL_FORM = {
  first_name:    '',
  last_name:     '',
  email:         '',
  phone:         '',
  username:      '',
  address_one:   '',
  city:          '',
  state:         '',
  zipcode:       '',
  date_of_birth: '',   // formato DD/MM
  last4ssn:      '',   // últimos 4 dígitos del CURP / SSN
  country:       'Mexico',
};

const REQUIRED = ['first_name', 'last_name', 'email', 'phone', 'username'];

function Field({ label, id, icon: Icon, error, ...props }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 uppercase tracking-wide ml-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          id={id}
          className={clsx(
            'block w-full py-2.5 border rounded-xl leading-5 bg-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'sm:text-sm transition-shadow shadow-sm',
            Icon ? 'pl-9 pr-3' : 'px-3',
            error ? 'border-red-300 bg-red-50' : 'border-gray-200'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
}

export default function IdentificationScreen({ onValidated }) {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    REQUIRED.forEach((k) => {
      if (!form[k].trim()) errs[k] = 'Campo requerido';
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Correo inválido';
    }
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = 'Teléfono debe tener 10 dígitos';
    }
    if (form.date_of_birth && !/^\d{2}\/\d{2}$/.test(form.date_of_birth)) {
      errs.date_of_birth = 'Formato requerido: DD/MM';
    }
    if (form.last4ssn && !/^\d{4}$/.test(form.last4ssn)) {
      errs.last4ssn = 'Deben ser exactamente 4 dígitos';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const baseURL =
        import.meta.env.VITE_BANTOS_API_URL?.replace('/validate-device', '') ||
        'https://bantos.cloud/datacenter-api/webview';

      console.group('👤 [WEBVIEW PASO 1] Registro de cliente en Dynamicore');
      console.log('Payload:', { ...form, last4ssn: '****' });

      const res = await axios.post(
        `${baseURL}/card-payments/create-customer`,
        form
      );

      console.log('Respuesta:', res.data);
      console.groupEnd();

      if (res.data.success) {
        const { customer_id, from_cache } = res.data;
        console.log(
          from_cache
            ? `✅ Cliente reutilizado (ya existía): ${customer_id}`
            : `✅ Cliente nuevo creado: ${customer_id}`
        );
        onValidated({ client_id: customer_id });
      } else {
        setError(res.data.message || 'No se pudo registrar el cliente.');
      }
    } catch (err) {
      console.groupEnd();
      console.error('❌ Error en Paso 1:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error de conexión. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || REQUIRED.some((k) => !form[k].trim());

  return (
    <div className="flex flex-col space-y-5 animate-in fade-in zoom-in duration-300 p-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-indigo-100 mb-1">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Datos del cliente</h2>
        <p className="text-xs text-gray-500 px-4">
          Completa tu información para registrarte y proceder con el pago.
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start text-sm border border-red-100">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre y apellido */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Nombre *"
            id="first_name"
            icon={User}
            placeholder="Juan"
            value={form.first_name}
            onChange={set('first_name')}
            error={fieldErrors.first_name}
          />
          <Field
            label="Apellido *"
            id="last_name"
            placeholder="Pérez"
            value={form.last_name}
            onChange={set('last_name')}
            error={fieldErrors.last_name}
          />
        </div>

        {/* Email */}
        <Field
          label="Correo electrónico *"
          id="email"
          icon={Mail}
          type="email"
          placeholder="juan@ejemplo.com"
          value={form.email}
          onChange={set('email')}
          error={fieldErrors.email}
        />

        {/* Teléfono y usuario */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Teléfono *"
            id="phone"
            icon={Phone}
            type="tel"
            placeholder="5512345678"
            maxLength={10}
            value={form.phone}
            onChange={set('phone')}
            error={fieldErrors.phone}
          />
          <Field
            label="Usuario *"
            id="username"
            icon={User}
            placeholder="juanperez01"
            value={form.username}
            onChange={set('username')}
            error={fieldErrors.username}
          />
        </div>

        {/* Dirección */}
        <Field
          label="Dirección"
          id="address_one"
          icon={MapPin}
          placeholder="Calle Insurgentes 123"
          value={form.address_one}
          onChange={set('address_one')}
          error={fieldErrors.address_one}
        />

        {/* Ciudad, Estado, CP */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <Field
              label="Ciudad"
              id="city"
              placeholder="CDMX"
              value={form.city}
              onChange={set('city')}
              error={fieldErrors.city}
            />
          </div>
          <div className="col-span-1">
            <Field
              label="Estado"
              id="state"
              placeholder="Ciudad de México"
              value={form.state}
              onChange={set('state')}
              error={fieldErrors.state}
            />
          </div>
          <div className="col-span-1">
            <Field
              label="CP"
              id="zipcode"
              placeholder="06600"
              maxLength={5}
              value={form.zipcode}
              onChange={set('zipcode')}
              error={fieldErrors.zipcode}
            />
          </div>
        </div>

        {/* Fecha de nacimiento y últimos 4 de CURP */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Nacimiento (DD/MM)"
            id="date_of_birth"
            icon={Calendar}
            placeholder="28/12"
            maxLength={5}
            value={form.date_of_birth}
            onChange={set('date_of_birth')}
            error={fieldErrors.date_of_birth}
          />
          <Field
            label="Últimos 4 CURP"
            id="last4ssn"
            icon={Hash}
            placeholder="1234"
            maxLength={4}
            value={form.last4ssn}
            onChange={set('last4ssn')}
            error={fieldErrors.last4ssn}
          />
        </div>

        {/* País (fijo: México, solo informativo) */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide ml-1">
            País
          </label>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={form.country}
              onChange={set('country')}
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm shadow-sm appearance-none"
            >
              <option value="Mexico">México</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isDisabled}
          className={clsx(
            'w-full flex justify-center items-center gap-2 py-3.5 px-4 mt-4',
            'border border-transparent rounded-xl shadow-md text-sm font-semibold text-white',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            'transition-all active:scale-[0.98]',
            isDisabled
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          )}
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Registrar y continuar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-gray-400 mt-1">
          Tus datos se usan únicamente para identificarte y procesar el pago de forma segura.
        </p>
      </form>
    </div>
  );
}
