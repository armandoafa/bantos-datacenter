import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, ActivityIndicator, Alert, Image, Switch } from 'react-native';
import { Camera, PenTool, CreditCard, ChevronRight, ChevronLeft, QrCode, Upload, FileText } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen from 'react-native-signature-canvas';

const PHASES = ['Equipo', 'Cliente', 'Docs', 'Firma', 'Pago'];

const matchesProduct = (invModel, prodName) => {
  if (!invModel || !prodName) return false;
  const iM = invModel.toLowerCase();
  const pN = prodName.toLowerCase();
  if (iM === pN) return true;
  if (iM.includes(pN) || pN.includes(iM)) return true;
  
  const extractWords = (str) => str.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const iMWords = extractWords(iM);
  const pNWords = extractWords(pN);
  
  const intersection = iMWords.filter(w => pNWords.includes(w));
  return intersection.length >= 2 && intersection.some(w => /\d/.test(w));
};

const formatProductName = (product) => {
  if (!product) return '';
  const manufacturer = product.manufacturer ? `${product.manufacturer} ` : '';
  const name = product.name || '';
  return `${manufacturer}${name}`.trim().toUpperCase();
};

const SelectionModal = ({ visible, onClose, data, onSelect, title, keyExtractor, renderLabel }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl p-6 h-2/3">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-black text-slate-800">{title}</Text>
          <TouchableOpacity onPress={onClose}><Text className="text-blue-600 font-bold">Cerrar</Text></TouchableOpacity>
        </View>
        <FlatList 
          data={data}
          keyExtractor={keyExtractor}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => onSelect(item)} className="p-4 border-b border-slate-100">
              <Text className="text-slate-800 font-bold text-base">{renderLabel(item)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text className="text-slate-500 text-center py-4">No hay opciones disponibles</Text>}
        />
      </View>
    </View>
  </Modal>
);

const AgentSalesWizardScreen = ({ navigation }) => {
  const [currentPhase, setCurrentPhase] = useState(0);

  // API Data
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selections
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImei, setSelectedImei] = useState(null);
  const [manualImei, setManualImei] = useState('');
  
  // Client Selections
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    referenceName: '',
    referencePhone: ''
  });

  // Docs State
  const [docs, setDocs] = useState({ front: null, back: null });

  // Firma State
  const signatureRef = useRef();
  const [signature, setSignature] = useState(null);

  // Payment State
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Tarjeta Débito',
    status: 'Pendiente',
    date: new Date().toLocaleDateString('es-MX'),
    recurring: true,
    recurrenceDays: '16',
    accountName: '',
    accountNumber: ''
  });

  // Modals
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [imeiModalVisible, setImeiModalVisible] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tenantId = await AsyncStorage.getItem('tenantId');
        const userStr = await AsyncStorage.getItem('user');
        if (!tenantId) return;
        
        const user = userStr ? JSON.parse(userStr) : null;
        const params = new URLSearchParams({
          tenantId: tenantId,
          userId: user?.id || '',
          username: user?.username || '',
          role: user?.role || '',
          storeId: user?.storeId || user?.scope?.storeId || '',
          orgId: user?.scope?.orgId || '',
          scopeRole: user?.scope?.role || ''
        }).toString();

        const [plansRes, productsRes, invRes, clientsRes] = await Promise.all([
          fetch(`https://bantos.cloud/datacenter-api/backoffice/payment-plans?${params}`),
          fetch(`https://bantos.cloud/datacenter-api/backoffice/products?${params}`),
          fetch(`https://bantos.cloud/datacenter-api/backoffice/inventory?${params}`),
          fetch(`https://bantos.cloud/datacenter-api/backoffice/clients?tenantId=${tenantId}`)
        ]);

        const [plansData, productsData, invData, clientsData] = await Promise.all([
          plansRes.json(),
          productsRes.json(),
          invRes.json(),
          clientsRes.json()
        ]);

        setPlans(Array.isArray(plansData) ? plansData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setInventory(Array.isArray(invData) ? invData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
      } catch (error) {
        console.error("Error fetching wizard data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const availableInventory = selectedProduct 
    ? inventory.filter(item => 
        (matchesProduct(item.model, selectedProduct.name) || 
         matchesProduct(item.model, formatProductName(selectedProduct))) && 
        item.status === 'UNASSIGNED'
      )
    : inventory.filter(item => item.status === 'UNASSIGNED');

  const nextPhase = () => {
    if (currentPhase < PHASES.length - 1) {
      if (currentPhase === 3 && !signature && signatureRef.current) {
        signatureRef.current.readSignature(); 
      } else {
        setCurrentPhase(prev => prev + 1);
      }
    } else {
      Alert.alert('Venta Completada', 'Los datos han sido enviados exitosamente.');
      navigation.goBack();
    }
  };
  
  const prevPhase = () => {
    if (currentPhase > 0) setCurrentPhase(prev => prev - 1);
    else navigation.goBack();
  };

  const handleSignature = (sig) => {
    setSignature(sig);
    setCurrentPhase(prev => prev + 1);
  };

  const handleClearSignature = () => {
    setSignature(null);
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
  };

  const pickImage = async (side) => {
    Alert.alert(
      'Cargar Imagen',
      '¿Qué deseas usar?',
      [
        {
          text: 'Cámara',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.granted) {
              let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
              });
              if (!result.canceled) {
                setDocs({ ...docs, [side]: result.assets[0].uri });
              }
            } else {
              Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
            }
          }
        },
        {
          text: 'Galería',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.granted) {
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
              });
              if (!result.canceled) {
                setDocs({ ...docs, [side]: result.assets[0].uri });
              }
            } else {
              Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
            }
          }
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header / Stepper */}
      <View className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex-row justify-between items-center">
        {PHASES.map((phase, idx) => (
          <View key={phase} className="items-center flex-1">
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${currentPhase === idx ? 'bg-blue-600' : currentPhase > idx ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <Text className={`font-bold text-xs ${currentPhase >= idx ? 'text-white' : 'text-slate-400'}`}>{idx + 1}</Text>
            </View>
            <Text className={`text-[10px] uppercase font-bold text-center ${currentPhase === idx ? 'text-blue-600' : 'text-slate-400'}`}>{phase}</Text>
          </View>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* FASE 1: Equipo */}
        {currentPhase === 0 && (
          <View className="space-y-6">
            <Text className="text-2xl font-black text-slate-800 mb-2">Selección de Equipo</Text>
            
            {loadingData ? (
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-slate-500 mt-4">Cargando datos del tenant...</Text>
              </View>
            ) : (
              <>
                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Plan Comercial</Text>
                  <TouchableOpacity onPress={() => setPlanModalVisible(true)} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <Text className={`font-bold ${selectedPlan ? 'text-slate-800' : 'text-slate-400'}`}>
                      {selectedPlan ? selectedPlan.name : 'Selecciona un plan...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Producto</Text>
                  <TouchableOpacity onPress={() => setProductModalVisible(true)} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <Text className={`font-bold ${selectedProduct ? 'text-slate-800' : 'text-slate-400'}`}>
                      {selectedProduct ? formatProductName(selectedProduct) : 'Selecciona un producto...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedProduct && selectedPlan && (
                  <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex-row justify-between items-center my-2">
                    <View>
                      <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Costo total del dispositivo</Text>
                      <Text className="text-2xl font-black text-emerald-800">${Number(selectedPlan.total_cost) > 0 ? selectedPlan.total_cost : (selectedProduct.base_value || '0.00')}</Text>
                    </View>
                  </View>
                )}

                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase mb-2">IMEI del Dispositivo</Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity 
                      onPress={() => setImeiModalVisible(true)} 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 justify-center"
                    >
                      <Text className={`font-bold ${selectedImei ? 'text-slate-800' : (manualImei ? 'text-slate-800' : 'text-slate-400')}`}>
                        {selectedImei ? selectedImei.serial_number : (manualImei || 'Selecciona de inventario...')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-slate-800 w-14 h-14 rounded-2xl items-center justify-center">
                      <QrCode color="#fff" size={24} />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-slate-400 mt-2">Pulsa el ícono para usar la cámara del celular.</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* FASE 2: Cliente */}
        {currentPhase === 1 && (
          <View className="space-y-6">
            <Text className="text-2xl font-black text-slate-800 mb-2">Datos del Cliente</Text>
            
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Cliente Existente</Text>
              <TouchableOpacity onPress={() => setClientModalVisible(true)} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <Text className={`font-bold ${selectedClient ? 'text-blue-600' : 'text-slate-400'}`}>
                  {selectedClient ? `${selectedClient.first_name || selectedClient.name} ${selectedClient.last_name || ''}`.trim() : 'Seleccionar cliente...'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Nombre(s)</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" 
                  value={clientData.firstName}
                  onChangeText={(t) => setClientData({...clientData, firstName: t})}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Apellidos</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" 
                  value={clientData.lastName}
                  onChangeText={(t) => setClientData({...clientData, lastName: t})}
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Teléfono Móvil (Principal)</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" 
                keyboardType="phone-pad" 
                value={clientData.phone}
                onChangeText={(t) => setClientData({...clientData, phone: t})}
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Dirección de Residencia</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold h-24 text-left" 
                multiline 
                textAlignVertical="top"
                value={clientData.address}
                onChangeText={(t) => setClientData({...clientData, address: t})}
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Referencia / Aval</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" 
                  value={clientData.referenceName}
                  onChangeText={(t) => setClientData({...clientData, referenceName: t})}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Teléfono Ref.</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" 
                  keyboardType="phone-pad"
                  value={clientData.referencePhone}
                  onChangeText={(t) => setClientData({...clientData, referencePhone: t})}
                />
              </View>
            </View>

          </View>
        )}

        {/* FASE 3: Documentos */}
        {currentPhase === 2 && (
          <View className="space-y-6">
            <Text className="text-2xl font-black text-slate-800 mb-2">Documentación</Text>
            
            <TouchableOpacity onPress={() => pickImage('front')} className="bg-blue-50 border border-blue-200 border-dashed rounded-3xl p-8 items-center justify-center overflow-hidden">
              {docs.front ? (
                <Image source={{ uri: docs.front }} className="w-full h-40 rounded-xl" resizeMode="cover" />
              ) : (
                <>
                  <Camera color="#2563eb" size={40} className="mb-4" />
                  <Text className="font-bold text-blue-800 text-lg">Tomar foto INE Frente</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage('back')} className="bg-blue-50 border border-blue-200 border-dashed rounded-3xl p-8 items-center justify-center overflow-hidden">
              {docs.back ? (
                <Image source={{ uri: docs.back }} className="w-full h-40 rounded-xl" resizeMode="cover" />
              ) : (
                <>
                  <Camera color="#2563eb" size={40} className="mb-4" />
                  <Text className="font-bold text-blue-800 text-lg">Tomar foto INE Reverso</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* FASE 4: Firma */}
        {currentPhase === 3 && (
          <View className="space-y-6 flex-1">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-2xl font-black text-slate-800">Firma Digital</Text>
              <TouchableOpacity onPress={handleClearSignature}>
                <Text className="text-blue-600 font-bold">Limpiar</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-slate-500 mb-4">Pide al cliente que firme con el dedo en el siguiente recuadro.</Text>
            
            <View className="bg-slate-50 border-2 border-slate-200 rounded-3xl h-80 items-center justify-center overflow-hidden relative w-full">
              {signature ? (
                <Image source={{ uri: signature }} className="w-full h-full" resizeMode="contain" />
              ) : (
                <SignatureScreen
                  ref={signatureRef}
                  onOK={handleSignature}
                  webStyle={`
                    .m-signature-pad { box-shadow: none; border: none; margin: 0; width: 100%; height: 100%; }
                    .m-signature-pad--body { border: none; }
                    .m-signature-pad--footer { display: none; }
                  `}
                  bgSrc=""
                  bgWidth={0}
                  bgHeight={0}
                />
              )}
            </View>
          </View>
        )}

        {/* FASE 5: Pago */}
        {currentPhase === 4 && (
          <View className="space-y-6">
            <Text className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Información del pago / venta</Text>
            
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Pago inicial</Text>
              <TextInput 
                className={`bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold ${Number(selectedPlan?.upfront_percentage) > 0 ? 'text-slate-500' : 'text-slate-800'}`} 
                value={Number(selectedPlan?.upfront_percentage) > 0 ? selectedPlan.upfront_percentage.toString() : paymentData.amount}
                onChangeText={(t) => setPaymentData({...paymentData, amount: t})}
                keyboardType="numeric"
                editable={!(Number(selectedPlan?.upfront_percentage) > 0)}
              />
            </View>

            <View className="mt-8 space-y-3">
              <Text className="text-xs font-bold text-slate-400 uppercase text-center mb-2">Documentos de la Venta</Text>
              <TouchableOpacity 
                className="bg-blue-600 rounded-2xl py-4 flex-row justify-center items-center opacity-50"
                onPress={() => Alert.alert('Aviso', 'El Voucher estará disponible después de registrar la venta.')}
              >
                <FileText color="white" size={20} className="mr-2" />
                <Text className="text-white font-bold text-center">Imprimir Voucher</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white border-2 border-slate-200 rounded-2xl py-4 flex-row justify-center items-center opacity-50"
                onPress={() => Alert.alert('Aviso', 'El Contrato estará disponible después de registrar la venta.')}
              >
                <FileText color="#475569" size={20} className="mr-2" />
                <Text className="text-slate-700 font-bold text-center">Imprimir Contrato</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Método</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                  value={paymentData.method}
                  onChangeText={(t) => setPaymentData({...paymentData, method: t})}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Estado</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                  value={paymentData.status}
                  editable={false}
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Fecha de pago</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                value={paymentData.date}
                editable={false}
              />
            </View>

            <View className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mt-4">
              <View className="flex-row items-center mb-6">
                <Switch 
                  value={paymentData.recurring} 
                  onValueChange={(val) => setPaymentData({...paymentData, recurring: val})} 
                  trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                />
                <Text className="text-blue-800 font-bold ml-2 uppercase text-xs tracking-wider">Habilitar pago recurrente</Text>
              </View>

              <Text className="text-xs font-bold text-blue-600 uppercase mb-2">Días de recurrencia (Ej. 01, 15)</Text>
              <TextInput 
                className="bg-white border border-blue-200 rounded-2xl p-4 font-bold text-blue-900" 
                value={paymentData.recurrenceDays}
                onChangeText={(t) => setPaymentData({...paymentData, recurrenceDays: t})}
              />

              <TouchableOpacity className="mt-4 flex-row items-center">
                <Text className="text-blue-600 font-bold text-xs uppercase tracking-wider ml-1">Ver Cronograma de Pagos</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-6 mb-2">Datos de cuenta / tarjeta</Text>
            
            <View className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Titular de la cuenta</Text>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                  placeholder="Nombre como aparece en cuenta"
                  value={paymentData.accountName}
                  onChangeText={(t) => setPaymentData({...paymentData, accountName: t})}
                />
              </View>
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Número de cuenta / Referencia / CLABE</Text>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                  placeholder="Referencia de pago"
                  value={paymentData.accountNumber}
                  onChangeText={(t) => setPaymentData({...paymentData, accountNumber: t})}
                />
              </View>
            </View>

          </View>
        )}

      </ScrollView>

      {/* Bottom Nav Buttons */}
      <View className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-white border-t border-slate-100 flex-row gap-4">
        <TouchableOpacity 
          className="flex-1 bg-slate-100 p-4 rounded-2xl items-center justify-center flex-row"
          onPress={prevPhase}
        >
          <ChevronLeft color="#475569" size={20} />
          <Text className="text-slate-600 font-bold ml-2">{currentPhase === 0 ? 'Cancelar' : 'Atrás'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 bg-blue-600 p-4 rounded-2xl items-center justify-center flex-row"
          onPress={nextPhase}
        >
          <Text className="text-white font-bold mr-2">{currentPhase === PHASES.length - 1 ? 'Finalizar' : 'Siguiente'}</Text>
          {currentPhase < PHASES.length - 1 && <ChevronRight color="#ffffff" size={20} />}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <SelectionModal 
        visible={planModalVisible} 
        onClose={() => setPlanModalVisible(false)} 
        data={plans} 
        title="Selecciona el Plan"
        keyExtractor={(item) => item.id.toString()}
        renderLabel={(item) => item.name}
        onSelect={(item) => { setSelectedPlan(item); setPlanModalVisible(false); }}
      />

      <SelectionModal 
        visible={productModalVisible} 
        onClose={() => setProductModalVisible(false)} 
        data={products} 
        title="Selecciona el Producto"
        keyExtractor={(item) => item.id.toString()}
        renderLabel={(item) => formatProductName(item)}
        onSelect={(item) => { setSelectedProduct(item); setSelectedImei(null); setProductModalVisible(false); }}
      />

      <SelectionModal 
        visible={imeiModalVisible} 
        onClose={() => setImeiModalVisible(false)} 
        data={availableInventory} 
        title="Selecciona de Inventario"
        keyExtractor={(item) => item.id.toString()}
        renderLabel={(item) => `${item.serial_number} - ${item.model || ''}`}
        onSelect={(item) => { setSelectedImei(item); setImeiModalVisible(false); }}
      />

      <SelectionModal 
        visible={clientModalVisible} 
        onClose={() => setClientModalVisible(false)} 
        data={clients} 
        title="Selecciona un Cliente"
        keyExtractor={(item) => item.id.toString()}
        renderLabel={(item) => `${item.first_name || item.name} ${item.last_name || ''} - ${item.phone || item.phone_number || ''}`}
        onSelect={(item) => { 
          setSelectedClient(item); 
          setClientData({
            firstName: item.first_name || item.name || '',
            lastName: item.last_name || '',
            phone: item.phone || item.phone_number || '',
            address: item.address || item.street_address || '',
            referenceName: item.reference_name || item.emergency_contact_name || '',
            referencePhone: item.reference_phone || item.emergency_contact_phone || ''
          });
          setClientModalVisible(false); 
        }}
      />

    </SafeAreaView>
  );
};

export default AgentSalesWizardScreen;

