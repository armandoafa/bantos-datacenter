import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle2, Zap, Droplet, Tv, MapPin } from 'lucide-react-native';
import POSButton from '../components/POSButton';
import WizardStepper from '../components/WizardStepper';

const STEPS = ['Servicio', 'Referencia', 'Cobro'];

const SERVICES = [
  { id: '1', name: 'CFE', icon: Zap, color: 'bg-green-600' },
  { id: '2', name: 'Agua', icon: Droplet, color: 'bg-blue-500' },
  { id: '3', name: 'Telmex', icon: MapPin, color: 'bg-sky-600' },
  { id: '4', name: 'Sky', icon: Tv, color: 'bg-blue-800' },
  { id: '5', name: 'Megacable', icon: Tv, color: 'bg-purple-600' },
  { id: '6', name: 'Totalplay', icon: Tv, color: 'bg-slate-800' },
];

const ServicesScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    service: null,
    reference: '',
    amount: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const updateData = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepService = () => (
    <View className="flex-1 p-4">
      <Text className="text-slate-500 mb-4 font-bold text-lg text-center">Selecciona el servicio a pagar</Text>
      <FlatList 
        data={SERVICES}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        renderItem={({item}) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity 
              onPress={() => { updateData('service', item); nextStep(); }}
              className={`w-[48%] h-32 rounded-2xl items-center justify-center shadow-sm ${item.color}`}
            >
              <Icon size={32} color="#ffffff" className="mb-2" />
              <Text className="text-xl font-black text-white">{item.name}</Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  );

  const renderStepReference = () => (
    <View className="flex-1 p-4">
      <View className="bg-white p-5 rounded-2xl border-2 border-slate-200 mb-6">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Línea de Captura / Referencia</Text>
        <TextInput 
          value={data.reference}
          onChangeText={t => updateData('reference', t.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          className="text-2xl font-black text-slate-800 tracking-widest border-b border-slate-200 pb-2"
          placeholder="00000000000000"
        />
      </View>

      <View className="bg-white p-5 rounded-2xl border-2 border-slate-200 mb-6">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monto a pagar ($)</Text>
        <TextInput 
          value={data.amount}
          onChangeText={t => updateData('amount', t.replace(/[^0-9.]/g, ''))}
          keyboardType="numeric"
          className="text-4xl font-black text-emerald-600 border-b border-slate-200 pb-2"
          placeholder="0.00"
        />
      </View>

      <View className="flex-row gap-4 mt-auto">
        <View className="flex-1">
          <POSButton title="Cancelar" variant="secondary" onPress={prevStep} />
        </View>
        <View className="flex-[2]">
          <POSButton 
            title="Siguiente" 
            variant="primary" 
            disabled={!data.reference || !data.amount || parseFloat(data.amount) <= 0}
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
        alert('Pago procesado exitosamente.');
        navigation.navigate('MainMenu');
      }, 2000);
    };

    if (isProcessing) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text className="text-xl font-black text-slate-800 mt-6 text-center">Procesando pago de {data.service?.name}...</Text>
        </View>
      );
    }

    const Icon = data.service?.icon || CheckCircle2;

    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${data.service?.color || 'bg-slate-200'}`}>
          <Icon size={48} color="#ffffff" />
        </View>
        <Text className="text-3xl font-black text-slate-800 text-center mb-2">Pago de {data.service?.name}</Text>
        <Text className="text-sm font-mono text-slate-500 mb-6" numberOfLines={1} ellipsizeMode="middle">Ref: {data.reference}</Text>
        
        <View className="w-full bg-white p-6 rounded-2xl border-2 border-slate-200 border-dashed mb-8 items-center">
          <Text className="text-sm font-bold uppercase text-slate-400 mb-1">Total a cobrar</Text>
          <Text className="text-5xl font-black text-emerald-600">${parseFloat(data.amount).toFixed(2)}</Text>
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
        {currentStep === 1 && renderStepService()}
        {currentStep === 2 && renderStepReference()}
        {currentStep === 3 && renderStepCheckout()}
      </View>
    </SafeAreaView>
  );
};

export default ServicesScreen;
