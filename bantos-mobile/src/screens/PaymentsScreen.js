import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Users, Search, CreditCard, CheckCircle2, ChevronRight, Phone } from 'lucide-react-native';
import POSButton from '../components/POSButton';
import WizardStepper from '../components/WizardStepper';

const STEPS = ['Cliente', 'Deuda', 'Cobro'];

// Mock Data
const MOCK_CLIENTS = [
  { upya_id: 'C-0001', name: 'Armando Fernández', phone: '55 1234 5678', pendingBalance: 500, plan: '12 Meses PAYG' },
  { upya_id: 'C-0002', name: 'María González', phone: '81 9876 5432', pendingBalance: 900, plan: '6 Meses PAYG' },
  { upya_id: 'C-0003', name: 'Juan Pérez', phone: '33 4567 8901', pendingBalance: 250, plan: '24 Meses PAYG' },
];

const PaymentsScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    client: null,
    amountToPay: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const updateData = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepSearch = () => {
    const filtered = MOCK_CLIENTS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.upya_id.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <View className="flex-1 p-4">
        <View className="bg-white flex-row items-center px-4 py-3 rounded-2xl border border-slate-200 shadow-sm mb-4">
          <Search color="#cbd5e1" className="mr-2" />
          <TextInput 
            value={searchQuery} onChangeText={setSearchQuery}
            placeholder="Buscar por nombre o ID..."
            className="flex-1 text-lg font-bold text-slate-800"
          />
        </View>

        <FlatList 
          data={filtered}
          keyExtractor={item => item.upya_id}
          renderItem={({item}) => (
            <TouchableOpacity 
              onPress={() => { updateData('client', item); updateData('amountToPay', item.pendingBalance.toString()); nextStep(); }}
              className="bg-white p-5 rounded-2xl mb-3 border border-slate-200 flex-row items-center"
            >
              <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center mr-4">
                <Users color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
                <Text className="text-sm font-mono text-slate-500">{item.upya_id}</Text>
              </View>
              <View className="items-end mr-3">
                <Text className="text-[10px] uppercase font-black tracking-widest text-slate-400">Deuda</Text>
                <Text className="text-lg font-black text-red-500">${item.pendingBalance}</Text>
              </View>
              <ChevronRight color="#cbd5e1" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center p-10 bg-white rounded-2xl border border-slate-200 border-dashed">
              <Text className="text-slate-400 font-bold">No se encontró ningún cliente con deuda</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderStepDebt = () => (
    <View className="flex-1 p-4">
      <View className="bg-slate-800 p-6 rounded-3xl mb-6 shadow-lg shadow-slate-800/30">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Información del Cliente</Text>
        <Text className="text-white font-black text-2xl mb-1">{data.client?.name}</Text>
        <View className="flex-row items-center mb-4">
          <Phone size={14} color="#94a3b8" />
          <Text className="text-slate-400 font-mono ml-2">{data.client?.phone}</Text>
        </View>
        <View className="h-px bg-slate-700 w-full mb-4" />
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-slate-400 text-xs font-bold mb-1">Plan contratado</Text>
            <Text className="text-slate-200 font-bold">{data.client?.plan}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total a liquidar</Text>
            <Text className="text-red-400 font-black text-2xl">${data.client?.pendingBalance}</Text>
          </View>
        </View>
      </View>

      <View className="bg-white p-5 rounded-2xl border-2 border-slate-200 mb-6">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ingresar abono ($)</Text>
        <TextInput 
          value={data.amountToPay}
          onChangeText={t => updateData('amountToPay', t.replace(/[^0-9.]/g, ''))}
          keyboardType="numeric"
          className="text-4xl font-black text-emerald-600 border-b border-slate-200 pb-2"
          placeholder="0.00"
        />
        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity 
            onPress={() => updateData('amountToPay', data.client?.pendingBalance.toString())}
            className="flex-1 bg-slate-100 py-3 rounded-lg items-center border border-slate-200"
          >
            <Text className="text-slate-600 font-bold text-sm">Liquidar Total</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => updateData('amountToPay', (data.client?.pendingBalance / 2).toString())}
            className="flex-1 bg-slate-100 py-3 rounded-lg items-center border border-slate-200"
          >
            <Text className="text-slate-600 font-bold text-sm">Abonar 50%</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-4 mt-auto">
        <View className="flex-1">
          <POSButton title="Atrás" variant="secondary" onPress={prevStep} />
        </View>
        <View className="flex-[2]">
          <POSButton 
            title="Siguiente" 
            variant="primary" 
            disabled={!data.amountToPay || parseFloat(data.amountToPay) <= 0 || parseFloat(data.amountToPay) > data.client?.pendingBalance}
            onPress={nextStep} 
          />
        </View>
      </View>
    </View>
  );

  const renderStepCheckout = () => {
    const handleCheckout = () => {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        alert('Pago registrado y dispositivo desbloqueado.');
        navigation.navigate('MainMenu');
      }, 2000);
    };

    if (isProcessing) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text className="text-xl font-black text-slate-800 mt-6 text-center">Registrando pago y contactando a Trustonic...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
          <CheckCircle2 size={48} color="#059669" />
        </View>
        <Text className="text-3xl font-black text-slate-800 text-center mb-2">Cobro a Cliente</Text>
        <Text className="text-sm font-bold text-slate-500 mb-6">{data.client?.name}</Text>
        
        <View className="w-full bg-white p-6 rounded-2xl border-2 border-slate-200 border-dashed mb-8 items-center">
          <Text className="text-sm font-bold uppercase text-slate-400 mb-1">Abono a recibir</Text>
          <Text className="text-5xl font-black text-emerald-600">${parseFloat(data.amountToPay).toFixed(2)}</Text>
        </View>

        <View className="w-full space-y-4">
          <POSButton title="Cobrar Efectivo" variant="success" onPress={handleCheckout} size="huge" />
          <POSButton title="Cobrar Tarjeta" variant="outline" onPress={handleCheckout} />
        </View>
        <View className="w-full mt-4">
          <POSButton title="Atrás" variant="secondary" onPress={prevStep} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 flex-col">
      <WizardStepper steps={STEPS} currentStep={currentStep} />
      <View className="flex-1">
        {currentStep === 1 && renderStepSearch()}
        {currentStep === 2 && renderStepDebt()}
        {currentStep === 3 && renderStepCheckout()}
      </View>
    </SafeAreaView>
  );
};

export default PaymentsScreen;
