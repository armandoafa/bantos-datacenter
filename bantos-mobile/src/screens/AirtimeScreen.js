import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Smartphone, CheckCircle2, DollarSign } from 'lucide-react-native';
import POSButton from '../components/POSButton';
import WizardStepper from '../components/WizardStepper';

const STEPS = ['Compañía', 'Número', 'Cobro'];

const CARRIERS = [
  { id: '1', name: 'Telcel', color: 'bg-blue-600', textColor: 'text-white' },
  { id: '2', name: 'AT&T', color: 'bg-sky-500', textColor: 'text-white' },
  { id: '3', name: 'Movistar', color: 'bg-green-500', textColor: 'text-white' },
  { id: '4', name: 'Unefon', color: 'bg-yellow-400', textColor: 'text-slate-800' },
  { id: '5', name: 'Bait', color: 'bg-purple-600', textColor: 'text-white' },
  { id: '6', name: 'Virgin', color: 'bg-red-500', textColor: 'text-white' },
];

const AMOUNTS = [20, 30, 50, 100, 150, 200, 500];

const AirtimeScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    carrier: null,
    phone: '',
    amount: null
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const updateData = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepCarrier = () => (
    <View className="flex-1 p-4">
      <Text className="text-slate-500 mb-4 font-bold text-lg text-center">Selecciona la compañía celular</Text>
      <FlatList 
        data={CARRIERS}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        renderItem={({item}) => (
          <TouchableOpacity 
            onPress={() => { updateData('carrier', item); nextStep(); }}
            className={`w-[48%] h-24 rounded-2xl items-center justify-center shadow-sm ${item.color}`}
          >
            <Text className={`text-xl font-black ${item.textColor}`}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderStepDetails = () => (
    <View className="flex-1 p-4">
      <View className="bg-white p-4 rounded-2xl border-2 border-slate-200 mb-6">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Número Telefónico (10 dígitos)</Text>
        <TextInput 
          value={data.phone}
          onChangeText={t => updateData('phone', t.replace(/[^0-9]/g, '').slice(0, 10))}
          keyboardType="numeric"
          className="text-3xl font-black text-slate-800 tracking-widest"
          placeholder="000 000 0000"
          maxLength={10}
        />
      </View>

      <Text className="text-slate-500 mb-2 font-bold ml-2">Monto a recargar:</Text>
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        {AMOUNTS.map(amt => (
          <TouchableOpacity 
            key={amt}
            onPress={() => updateData('amount', amt)}
            className={`w-[31%] h-16 items-center justify-center rounded-xl border-2 ${data.amount === amt ? 'bg-blue-600 border-blue-700' : 'bg-white border-slate-200'}`}
          >
            <Text className={`text-xl font-bold ${data.amount === amt ? 'text-white' : 'text-slate-700'}`}>${amt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row gap-4 mt-auto">
        <View className="flex-1">
          <POSButton title="Cancelar" variant="secondary" onPress={prevStep} />
        </View>
        <View className="flex-[2]">
          <POSButton 
            title="Siguiente" 
            variant="primary" 
            disabled={data.phone.length !== 10 || !data.amount}
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
        alert('Recarga aplicada exitosamente.');
        navigation.navigate('MainMenu');
      }, 2000);
    };

    if (isProcessing) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text className="text-xl font-black text-slate-800 mt-6 text-center">Procesando recarga...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
          <Smartphone size={48} color="#1d4ed8" />
        </View>
        <Text className="text-3xl font-black text-slate-800 text-center mb-2">Recarga {data.carrier?.name}</Text>
        <Text className="text-2xl font-mono text-slate-500 mb-6">{data.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</Text>
        
        <View className="w-full bg-white p-6 rounded-2xl border-2 border-slate-200 border-dashed mb-8 items-center">
          <Text className="text-sm font-bold uppercase text-slate-400 mb-1">Total a cobrar</Text>
          <Text className="text-5xl font-black text-emerald-600">${data.amount}</Text>
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
        {currentStep === 1 && renderStepCarrier()}
        {currentStep === 2 && renderStepDetails()}
        {currentStep === 3 && renderStepCheckout()}
      </View>
    </SafeAreaView>
  );
};

export default AirtimeScreen;
