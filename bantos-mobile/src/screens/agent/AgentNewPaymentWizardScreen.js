import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, Switch } from 'react-native';
import { Search, CheckCircle, ChevronRight, FileText, ChevronLeft, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AgentNewPaymentWizardScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedContract, setSelectedContract] = useState(null);
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Transferencia',
    status: 'Pendiente',
    date: new Date().toLocaleDateString('es-MX'),
    recurring: false,
    recurrenceDays: '',
    accountName: '',
    accountNumber: '',
    reference: ''
  });

  const [successData, setSuccessData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 3) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setIsSearching(true);
      const tenantId = await AsyncStorage.getItem('tenantId');
      
      const response = await fetch(`https://bantos.cloud/datacenter-api/backoffice/contracts?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        const results = data.filter(c => 
          c.id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.client_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.device_info?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results.slice(0, 5)); // Limit to 5 results
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectContract = (contract) => {
    setSelectedContract(contract);
    // Pretend to calculate recommended amount based on contract balance/installments
    const recommendedAmount = contract.total_amount ? (parseFloat(contract.total_amount) / 12).toFixed(2) : '0';
    setPaymentData({ ...paymentData, amount: recommendedAmount });
    setStep(2);
  };

  const submitPayment = async () => {
    if (!paymentData.amount || isNaN(parseFloat(paymentData.amount)) || parseFloat(paymentData.amount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido mayor a 0.');
      return;
    }

    try {
      setLoading(true);
      const tenantId = await AsyncStorage.getItem('tenantId');
      
      const payload = {
        tenantId,
        contract_id: selectedContract.id,
        client_id: selectedContract.client_id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.method,
        reference: paymentData.reference,
        status: paymentData.status,
        is_recurring: paymentData.recurring,
        recurring_days: paymentData.recurrenceDays,
        account_name: paymentData.accountName,
        account_number: paymentData.accountNumber || paymentData.reference
      };

      const response = await fetch(`https://bantos.cloud/datacenter-api/backoffice/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessData(data);
        setShowSuccessModal(true);
      } else {
        const err = await response.json();
        Alert.alert('Error', err.error || 'Ocurrió un error al registrar el pago.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View className="flex-1">
      <Text className="text-2xl font-black text-slate-800 mb-2">Buscar Contrato</Text>
      <Text className="text-slate-500 mb-6">Ingresa el número de contrato o el nombre del cliente para iniciar el pago.</Text>
      
      <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm mb-6">
        <Search size={24} color="#94a3b8" />
        <TextInput
          className="flex-1 ml-3 font-medium text-slate-800 text-lg"
          placeholder="Ej. A12417615"
          placeholderTextColor="#cbd5e1"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {isSearching && <ActivityIndicator size="small" color="#2563eb" />}
      </View>

      {searchResults.length > 0 ? (
        <ScrollView className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          {searchResults.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              className={`p-5 flex-row items-center justify-between ${index !== searchResults.length - 1 ? 'border-b border-slate-100' : ''}`}
              onPress={() => handleSelectContract(item)}
            >
              <View className="flex-1">
                <Text className="font-bold text-slate-800 text-lg">{item.id}</Text>
                <Text className="text-slate-500" numberOfLines={1}>{item.client_id || item.device_info || 'Sin asignar'}</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : searchQuery.length >= 3 && !isSearching ? (
        <View className="items-center py-10">
          <Text className="text-slate-500 font-medium text-lg">No se encontraron resultados</Text>
        </View>
      ) : null}
    </View>
  );

  const renderStep2 = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        className="flex-row items-center mb-6" 
        onPress={() => setStep(1)}
      >
        <ChevronLeft size={24} color="#64748b" />
        <Text className="text-slate-500 font-bold ml-1">Cambiar contrato</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-black text-slate-800 mb-6">Detalles del Pago</Text>

      {/* Contract Summary Card */}
      <View className="bg-blue-50 border border-blue-100 rounded-[24px] p-6 mb-8">
        <Text className="text-blue-400 font-bold uppercase text-xs mb-1">Contrato Seleccionado</Text>
        <Text className="text-blue-900 font-black text-xl mb-1">{selectedContract?.id}</Text>
        <Text className="text-blue-800 font-medium">{selectedContract?.client_id || selectedContract?.device_info || 'Cliente no asignado'}</Text>
      </View>

      {/* Form */}
      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Monto a Pagar ($)</Text>
        <TextInput 
          className="bg-white border-2 border-slate-200 rounded-2xl p-5 text-2xl font-black text-slate-800" 
          value={paymentData.amount}
          onChangeText={(t) => setPaymentData({...paymentData, amount: t})}
          keyboardType="numeric"
          placeholder="0.00"
        />
      </View>

      <View className="flex-row gap-4 mb-6">
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Método</Text>
          <TextInput 
            className="bg-white border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
            value={paymentData.method}
            onChangeText={(t) => setPaymentData({...paymentData, method: t})}
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Estado</Text>
          <TextInput 
            className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
            value={paymentData.status}
            editable={false}
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Fecha de pago</Text>
        <TextInput 
          className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
          value={paymentData.date}
          editable={false}
        />
      </View>

      <View className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mb-6">
        <View className="flex-row items-center">
          <Switch 
            value={paymentData.recurring} 
            onValueChange={(val) => setPaymentData({...paymentData, recurring: val})} 
            trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
          />
          <Text className="text-blue-800 font-bold ml-2 uppercase text-xs tracking-wider">Habilitar pago recurrente</Text>
        </View>
        
        {paymentData.recurring && (
          <View className="mt-4">
            <Text className="text-xs font-bold text-blue-600 uppercase mb-2">Días de recurrencia (Ej. 01, 15)</Text>
            <TextInput 
              className="bg-white border border-blue-200 rounded-2xl p-4 font-bold text-blue-900" 
              value={paymentData.recurrenceDays}
              onChangeText={(t) => setPaymentData({...paymentData, recurrenceDays: t})}
            />
          </View>
        )}
      </View>

      <Text className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Datos de cuenta / tarjeta</Text>
      <View className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-6">
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
            placeholder="Referencia de pago..."
            value={paymentData.accountNumber}
            onChangeText={(t) => setPaymentData({...paymentData, accountNumber: t})}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        className={`bg-slate-800 rounded-2xl p-5 flex-row justify-center items-center mt-4 mb-10 ${loading ? 'opacity-70' : ''}`}
        onPress={submitPayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text className="text-white font-black text-lg mr-2">REGISTRAR PAGO</Text>
            <ArrowRight color="white" size={24} />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-6 pt-6 pb-4 flex-1">
          {step === 1 ? renderStep1() : renderStep2()}
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 items-center">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
              <CheckCircle size={48} color="#16a34a" />
            </View>
            <Text className="text-3xl font-black text-slate-800 mb-2">Pago Exitoso</Text>
            <Text className="text-slate-500 text-center text-lg mb-8">El pago se ha registrado correctamente en el sistema.</Text>
            
            <View className="w-full space-y-4">
              <TouchableOpacity 
                className="bg-blue-600 rounded-2xl p-5 flex-row justify-center items-center w-full"
                onPress={() => {
                  Alert.alert('Abriendo PDF', 'Abriendo el comprobante de pago...');
                }}
              >
                <FileText color="white" size={24} className="mr-3" />
                <Text className="text-white font-black text-lg">Imprimir Ticket PDF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-slate-100 rounded-2xl p-5 items-center w-full mt-4"
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text className="text-slate-700 font-bold text-lg">Volver a Pagos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AgentNewPaymentWizardScreen;
