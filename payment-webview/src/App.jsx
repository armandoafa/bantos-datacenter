import { useState, useEffect } from 'react';
import { CreditCard, Store, ShieldCheck } from 'lucide-react';
import PaymentCardForm from './components/PaymentCardForm';
import PaymentOxxoPay from './components/PaymentOxxoPay';
import IdentificationScreen from './components/IdentificationScreen';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function App() {
  const [step, setStep] = useState('construction'); // 'construction', 'auth' or 'payment'
  const [method, setMethod] = useState('card'); // 'card' or 'oxxo'
  const [amount, setAmount] = useState('0.00');
  const [clientId, setClientId] = useState('');
  
  const handleValidated = (data) => {
    // Establecemos por defecto 0.00 según lo solicitado para que el usuario ingrese su monto
    setAmount('0.00');
    setClientId(data.client_id);
    setStep('payment');
  };

  if (step === 'construction') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="text-xl text-gray-500 font-semibold">Proceso en construcción</h1>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white pt-10 pb-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[20%] rounded-full bg-indigo-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-3xl pointer-events-none"></div>
        
        <main className="flex-1 px-5 relative z-10 flex flex-col justify-center">
          <div className="glass rounded-3xl p-5 shadow-sm">
            <IdentificationScreen onValidated={handleValidated} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full relative overflow-x-hidden bg-gradient-to-br from-indigo-50/50 to-white pb-10">
      
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[20%] rounded-full bg-indigo-400/20 blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-8 flex flex-col items-center justify-center relative z-10 max-w-lg mx-auto w-full">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Monto / Total a Pagar</h1>
        <div className="relative flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-400 mr-1">$</span>
          <input 
            type="number"
            step="0.01"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-4xl font-extrabold text-gray-900 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl px-3 py-1 text-center w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-sm transition-all"
          />
          <span className="text-base ml-2 text-gray-500 font-medium">MXN</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
          <span>✎ Haz clic en el monto para modificarlo</span>
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-2 relative z-10 max-w-xl mx-auto w-full">
        <div className="glass rounded-3xl p-1 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setMethod('card')}
              className={cn(
                "flex-1 flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-200",
                method === 'card' 
                  ? "bg-white text-indigo-700 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Tarjeta
            </button>
            <button
              onClick={() => setMethod('oxxo')}
              className={cn(
                "flex-1 flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-200",
                method === 'oxxo' 
                  ? "bg-white text-red-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              <Store className="w-4 h-4 mr-2" />
              OXXO Pay
            </button>
          </div>
        </div>

        <div className="glass rounded-3xl p-5 shadow-sm">
          <div className={method === 'card' ? 'block' : 'hidden'}>
            <PaymentCardForm amount={amount} clientId={clientId} />
          </div>
          <div className={method === 'oxxo' ? 'block' : 'hidden'}>
            <PaymentOxxoPay amount={amount} clientId={clientId} />
          </div>
        </div>
        
        {/* Footer Logos / Trust badges */}
        <div className="mt-8 flex flex-col items-center justify-center space-y-3 opacity-60">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Pagos procesados por</p>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold text-gray-600 tracking-tighter">Dynamicore</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="text-xs font-bold text-gray-600 tracking-tighter">Conekta</span>
          </div>
        </div>
      </main>

    </div>
  );
}

export default App;
