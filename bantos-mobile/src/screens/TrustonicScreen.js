import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Lock, Unlock, Wifi, Bell, CheckCircle2, XCircle } from 'lucide-react-native';
import POSButton from '../components/POSButton';
import WizardStepper from '../components/WizardStepper';

const STEPS = ['Acción', 'Datos', 'Ejecución'];

const ACTIONS = [
  { id: '1', name: 'Bloqueo', icon: Lock, color: 'bg-red-600' },
  { id: '2', name: 'Desbloqueo', icon: Unlock, color: 'bg-emerald-600' },
  { id: '3', name: 'Ping', icon: Wifi, color: 'bg-blue-500' },
  { id: '4', name: 'Notificación', icon: Bell, color: 'bg-amber-500' },
  { id: '5', name: 'Activate', icon: CheckCircle2, color: 'bg-teal-600' },
  { id: '6', name: 'Deactivate', icon: XCircle, color: 'bg-slate-700' },
];

const TrustonicScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    action: null,
    imeis: '',
    message: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const updateData = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Render Step 1: Select Action
  const renderStepAction = () => (
    <View className="flex-1 p-4">
      <Text className="text-slate-500 mb-6 font-bold text-lg text-center">Selecciona el comando de Trustonic</Text>
      <FlatList 
        data={ACTIONS}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        renderItem={({item}) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity 
              onPress={() => { updateData('action', item); nextStep(); }}
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

  // Render Step 2: Form (IMEI & Message)
  const renderStepForm = () => (
    <View className="flex-1 p-4">
      <Text className="text-slate-500 mb-6 font-bold text-center">Ingresa los datos para el comando: {data.action?.name}</Text>
      
      <View className="bg-white p-5 rounded-2xl border-2 border-slate-200 mb-6">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">IMEI(s) del Dispositivo</Text>
        <TextInput 
          value={data.imeis}
          onChangeText={t => updateData('imeis', t)}
          className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2"
          placeholder="Ej. 358912345678901"
          multiline
          numberOfLines={2}
        />
        <Text className="text-xs text-slate-400 mt-2">Puedes ingresar varios IMEIs separados por coma o espacio.</Text>
      </View>

      <View className="bg-white p-5 rounded-2xl border-2 border-slate-200 mb-6">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mensaje / Notas Adjuntas</Text>
        <TextInput 
          value={data.message}
          onChangeText={t => updateData('message', t)}
          className="text-lg font-normal text-slate-800 border-b border-slate-200 pb-2"
          placeholder="Mensaje opcional..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="flex-row gap-4 mt-auto">
        <View className="flex-1">
          <POSButton title="Atrás" variant="secondary" onPress={prevStep} />
        </View>
        <View className="flex-[2]">
          <POSButton 
            title="Siguiente" 
            variant="primary" 
            disabled={!data.imeis.trim()}
            onPress={nextStep} 
          />
        </View>
      </View>
    </View>
  );

  // Render Step 3: Execution / Summary
  const renderStepExecution = () => {
    const handleExecute = () => {
      setIsProcessing(true);
      // Simulating API call to Trustonic
      setTimeout(() => {
        setIsProcessing(false);
        alert(`Comando ${data.action?.name} ejecutado con éxito.`);
        navigation.navigate('MainMenu');
      }, 2500);
    };

    if (isProcessing) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text className="text-xl font-black text-slate-800 mt-6 text-center">Contactando API de Trustonic...</Text>
          <Text className="text-slate-500 text-center mt-2">Enviando comando {data.action?.name}</Text>
        </View>
      );
    }

    const Icon = data.action?.icon || CheckCircle2;

    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${data.action?.color || 'bg-slate-200'}`}>
          <Icon size={48} color="#ffffff" />
        </View>
        <Text className="text-3xl font-black text-slate-800 text-center mb-2">Comando: {data.action?.name}</Text>
        <Text className="text-sm font-bold text-slate-500 mb-6 text-center">Verifica los datos antes de ejecutar el comando administrativo.</Text>
        
        <View className="w-full bg-white p-6 rounded-2xl border-2 border-slate-200 mb-8 items-start">
          <Text className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">IMEI(s) Objetivo</Text>
          <Text className="text-lg font-bold text-slate-800 mb-4">{data.imeis}</Text>
          
          <Text className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Mensaje Adjunto</Text>
          <Text className="text-base text-slate-600">{data.message || 'Ninguno'}</Text>
        </View>

        <View className="w-full space-y-4">
          <POSButton title="Ejecutar Comando" variant="primary" onPress={handleExecute} size="huge" />
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
        {currentStep === 1 && renderStepAction()}
        {currentStep === 2 && renderStepForm()}
        {currentStep === 3 && renderStepExecution()}
      </View>
    </SafeAreaView>
  );
};

export default TrustonicScreen;
