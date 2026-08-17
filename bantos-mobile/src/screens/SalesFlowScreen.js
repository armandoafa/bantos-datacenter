import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Users, Smartphone, CheckCircle2, ChevronRight, Camera, Image as ImageIcon } from 'lucide-react-native';
import SignatureScreen from 'react-native-signature-canvas';
import POSButton from '../components/POSButton';
import WizardStepper from '../components/WizardStepper';

const STEPS = ['Equipo', 'Contacto', 'Docs', 'Contrato', 'Firma', 'Cobro'];

// Mock Data
const MOCK_CLIENTS = [
  { upya_id: 'C-0001', name: 'Armando Fernández', email: 'armando@bantos.com' },
  { upya_id: 'C-0002', name: 'María González', email: 'maria.g@gmail.com' },
];

const MOCK_INVENTORY = [
  { id: '1', brand: 'Samsung', model: 'Galaxy A54', imei: '358912345678901', price: 6500 },
  { id: '2', brand: 'Motorola', model: 'Moto G Stylus', imei: '358912345678902', price: 4200 },
];

const MOCK_PLANS = [
  { id: 'p1', title: '12 Meses PAYG', upfront: 1500, monthly: 500 },
  { id: 'p2', title: '6 Meses PAYG', upfront: 2000, monthly: 900 },
  { id: 'p3', title: 'Contado', upfront: 0, monthly: 0 },
];

const SalesFlowScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saleData, setSaleData] = useState({
    device: null,
    client: null,
    documents: {
      ineFront: false,
      ineBack: false,
      proofOfAddress: false
    },
    plan: null,
    signature: null
  });

  // Step 2 State
  const [searchClient, setSearchClient] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  // Step 6 State
  const [isProcessing, setIsProcessing] = useState(false);

  const updateSaleData = (key, value) => {
    setSaleData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Render Step 1: Device
  const renderStepDevice = () => {
    return (
      <View className="flex-1 p-4">
        <Text className="text-slate-500 mb-4 font-bold">Asigna un equipo del inventario disponible a la venta.</Text>
        <FlatList 
          data={MOCK_INVENTORY}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity 
              onPress={() => { updateSaleData('device', item); nextStep(); }}
              className="bg-white p-5 rounded-2xl mb-3 border border-slate-200 flex-row items-center"
            >
              <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                <Smartphone color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-800">{item.brand} {item.model}</Text>
                <Text className="text-sm font-mono text-slate-500">IMEI: {item.imei}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Render Step 2: Client
  const renderStepClient = () => {
    const filtered = MOCK_CLIENTS.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase()));

    if (isCreatingClient) {
      return (
        <View className="flex-1 p-6">
          <Text className="text-xl font-black text-slate-800 mb-6">Crear Cliente Rápido</Text>
          <View className="space-y-4">
            <View>
              <Text className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1">Nombre Completo</Text>
              <TextInput 
                value={newClientName} onChangeText={setNewClientName}
                className="bg-white border-2 border-slate-200 rounded-xl py-4 px-5 font-bold text-slate-800 text-lg"
                placeholder="Ej. Juan Pérez"
              />
            </View>
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <POSButton title="Cancelar" variant="secondary" onPress={() => setIsCreatingClient(false)} />
              </View>
              <View className="flex-[2]">
                <POSButton 
                  title="Crear y Seleccionar" 
                  variant="primary" 
                  disabled={!newClientName}
                  onPress={() => {
                    updateSaleData('client', { upya_id: 'C-NEW', name: newClientName });
                    setIsCreatingClient(false);
                    nextStep();
                  }} 
                />
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 p-4">
        <View className="bg-white flex-row items-center px-4 py-3 rounded-2xl border border-slate-200 shadow-sm mb-4">
          <TextInput 
            value={searchClient} onChangeText={setSearchClient}
            placeholder="Buscar cliente existente..."
            className="flex-1 text-lg font-bold text-slate-800"
          />
        </View>

        <FlatList 
          data={filtered}
          keyExtractor={item => item.upya_id}
          renderItem={({item}) => (
            <TouchableOpacity 
              onPress={() => { updateSaleData('client', item); nextStep(); }}
              className="bg-white p-5 rounded-2xl mb-3 border border-slate-200 flex-row items-center"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                <Users color="#1d4ed8" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
                <Text className="text-sm text-slate-500">{item.upya_id}</Text>
              </View>
              <ChevronRight color="#cbd5e1" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center p-10 bg-white rounded-2xl border border-slate-200 border-dashed">
              <Text className="text-slate-400 font-bold mb-4">No se encontró al cliente</Text>
              <POSButton title="Crear Cliente Nuevo" onPress={() => setIsCreatingClient(true)} variant="outline" />
            </View>
          }
        />
        <View className="mt-4"><POSButton title="Volver a Dispositivos" variant="secondary" onPress={prevStep} /></View>
      </View>
    );
  };

  // Render Step 3: Documents
  const renderStepDocuments = () => {
    const toggleDoc = (docKey) => {
      setSaleData(prev => ({
        ...prev,
        documents: { ...prev.documents, [docKey]: !prev.documents[docKey] }
      }));
    };

    const allDocsUploaded = saleData.documents.ineFront && saleData.documents.ineBack && saleData.documents.proofOfAddress;

    const DocButton = ({ title, docKey }) => (
      <TouchableOpacity 
        onPress={() => toggleDoc(docKey)}
        className={`p-4 rounded-2xl border-2 flex-row items-center justify-between mb-4 ${saleData.documents[docKey] ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200'}`}
      >
        <View className="flex-row items-center">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${saleData.documents[docKey] ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            {saleData.documents[docKey] ? <CheckCircle2 color="#059669" /> : <Camera color="#64748b" />}
          </View>
          <Text className={`text-lg font-bold ${saleData.documents[docKey] ? 'text-emerald-700' : 'text-slate-700'}`}>{title}</Text>
        </View>
        <ImageIcon color={saleData.documents[docKey] ? '#059669' : '#cbd5e1'} />
      </TouchableOpacity>
    );

    return (
      <View className="flex-1 p-4">
        <Text className="text-slate-500 mb-6 font-bold text-center">Captura los documentos requeridos del cliente</Text>
        
        <DocButton title="INE Frente" docKey="ineFront" />
        <DocButton title="INE Reverso" docKey="ineBack" />
        <DocButton title="Comprobante de Domicilio" docKey="proofOfAddress" />

        <View className="flex-row gap-4 mt-auto">
          <View className="flex-1">
            <POSButton title="Atrás" variant="secondary" onPress={prevStep} />
          </View>
          <View className="flex-[2]">
            <POSButton title="Siguiente" variant="primary" disabled={!allDocsUploaded} onPress={nextStep} />
          </View>
        </View>
      </View>
    );
  };

  // Render Step 4: Plan/Contrato
  const renderStepPlan = () => {
    return (
      <View className="flex-1 p-4">
        <Text className="text-slate-500 mb-4 font-bold">Selecciona el plan para generar el contrato de {saleData.client?.name}</Text>
        <FlatList 
          data={MOCK_PLANS}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity 
              onPress={() => { updateSaleData('plan', item); nextStep(); }}
              className="bg-white p-6 rounded-2xl mb-4 border-2 border-slate-200"
            >
              <Text className="text-xl font-black text-slate-800 mb-2">{item.title}</Text>
              <View className="flex-row justify-between mt-4">
                <View>
                  <Text className="text-[10px] uppercase font-black tracking-widest text-slate-400">Pago Inicial</Text>
                  <Text className="text-lg font-bold text-slate-700">${item.upfront}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[10px] uppercase font-black tracking-widest text-slate-400">Mensualidad</Text>
                  <Text className="text-lg font-bold text-blue-600">${item.monthly}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <View className="mt-4"><POSButton title="Atrás" variant="secondary" onPress={prevStep} /></View>
      </View>
    );
  };

  // Render Step 5: Signature
  const renderStepSignature = () => {
    return (
      <View className="flex-1 p-4">
        <View className="bg-slate-800 p-6 rounded-3xl mb-4 shadow-lg shadow-slate-800/30">
          <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Resumen del Contrato</Text>
          <Text className="text-white font-black text-xl mb-1">{saleData.client?.name}</Text>
          <Text className="text-slate-300 mb-4">{saleData.device?.brand} {saleData.device?.model}</Text>
          <View className="h-px bg-slate-700 w-full mb-4" />
          <View className="flex-row justify-between items-center">
            <Text className="text-slate-300 font-bold">{saleData.plan?.title}</Text>
            <Text className="text-emerald-400 font-black text-2xl">Cobrar: ${saleData.plan?.upfront || saleData.device?.price}</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-500 mb-2 px-2">Firma del Cliente:</Text>
        <View className="flex-1 bg-white rounded-2xl overflow-hidden border-2 border-slate-200">
          <SignatureScreen
            onOK={(sig) => { updateSaleData('signature', sig); nextStep(); }}
            onEmpty={() => alert("La firma es requerida")}
            descriptionText="Firme en el recuadro blanco"
            clearText="Borrar"
            confirmText="Aceptar y Continuar"
            webStyle={`
              .m-signature-pad { box-shadow: none; border: none; margin: 0; width: 100%; height: 100%; }
              .m-signature-pad--footer { display: none; }
            `}
          />
        </View>
        
        <View className="flex-row gap-4 mt-4">
          <View className="w-1/3"><POSButton title="Atrás" variant="secondary" onPress={prevStep} /></View>
          <View className="flex-1"><POSButton title="Firmar y Avanzar" variant="primary" onPress={() => nextStep()} /></View>
        </View>
      </View>
    );
  };

  // Render Step 6: Checkout
  const renderStepCheckout = () => {
    const handleCheckout = () => {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        alert('Venta procesada con éxito en Terminal Datecs.');
        navigation.navigate('MainMenu');
      }, 2000);
    };

    if (isProcessing) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text className="text-xl font-black text-slate-800 mt-6 text-center">Enviando cobro a terminal Datecs...</Text>
          <Text className="text-slate-500 text-center mt-2">Por favor inserta, desliza o acerca la tarjeta del cliente.</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
          <CheckCircle2 size={48} color="#059669" />
        </View>
        <Text className="text-3xl font-black text-slate-800 text-center mb-2">Contrato Firmado</Text>
        <Text className="text-slate-500 text-center mb-10">El contrato se ha generado correctamente. Procede con el cobro inicial para activar el dispositivo Trustonic.</Text>
        
        <View className="w-full space-y-4">
          <POSButton title={`Cobrar Tarjeta ($${saleData.plan?.upfront || saleData.device?.price})`} variant="success" onPress={handleCheckout} size="huge" />
          <POSButton title="Cobrar Efectivo" variant="outline" onPress={handleCheckout} />
        </View>
        <View className="w-full mt-4"><POSButton title="Atrás" variant="secondary" onPress={prevStep} /></View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 flex-col">
      <WizardStepper steps={STEPS} currentStep={currentStep} />
      
      <View className="flex-1">
        {currentStep === 1 && renderStepDevice()}
        {currentStep === 2 && renderStepClient()}
        {currentStep === 3 && renderStepDocuments()}
        {currentStep === 4 && renderStepPlan()}
        {currentStep === 5 && renderStepSignature()}
        {currentStep === 6 && renderStepCheckout()}
      </View>
    </SafeAreaView>
  );
};

export default SalesFlowScreen;
