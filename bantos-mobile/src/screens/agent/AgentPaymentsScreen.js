import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, FlatList, TextInput, ActivityIndicator, Modal, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus, Search, Filter, CreditCard, Receipt, MoreVertical, X, FileText } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const AgentPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  
  const [paymentData, setPaymentData] = useState({
    contractId: '',
    clientId: '',
    amount: '',
    method: 'Transferencia',
    status: 'Pendiente',
    date: new Date().toLocaleDateString('es-MX'),
    recurring: false,
    recurrenceDays: '',
    accountName: '',
    accountNumber: ''
  });
  
  const isFocused = useIsFocused();

  const FILTERS = ['TODOS', 'ACEPTADOS', 'NO ASIGNADOS', 'FALLADOS'];

  useEffect(() => {
    if (isFocused) {
      fetchPayments();
    }
  }, [isFocused]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const tenantId = await AsyncStorage.getItem('tenantId');
      const userStr = await AsyncStorage.getItem('user');
      if (!tenantId || !userStr) return;

      const user = JSON.parse(userStr);
      const queryParams = new URLSearchParams({
        tenantId,
        userId: user.id || '',
        role: user.role || '',
        orgId: user.scope?.orgId || '',
        scopeRole: user.scope?.role || '',
        storeId: user.storeId || '',
        username: user.username || ''
      });

      const response = await fetch(`https://bantos.cloud/datacenter-api/backoffice/payments?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    // Filter by status
    if (activeFilter !== 'TODOS') {
      if (activeFilter === 'ACEPTADOS' && p.status !== 'ACCEPTED') return false;
      if (activeFilter === 'NO ASIGNADOS' && p.status !== 'UNASSIGNED') return false;
      if (activeFilter === 'FALLADOS' && p.status !== 'FAILED') return false;
    }

    // Search by query (contract_id, client_id, amount)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const contractMatch = p.contract_id?.toLowerCase().includes(q);
      const clientMatch = p.client_id?.toLowerCase().includes(q);
      const amountMatch = p.amount?.toString().includes(q);
      if (!contractMatch && !clientMatch && !amountMatch) return false;
    }

    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('es-MX', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleOpenPayment = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setPaymentData({
        contractId: payment.contract_id || '',
        clientId: payment.client_id || '',
        amount: payment.amount?.toString() || '',
        method: payment.payment_method || 'Transferencia',
        status: payment.status === 'ACCEPTED' ? 'Aceptado' : 'Pendiente',
        date: formatDate(payment.created_at) || new Date().toLocaleDateString('es-MX'),
        recurring: false,
        recurrenceDays: '',
        accountName: '',
        accountNumber: ''
      });
    } else {
      setEditingPayment(null);
      setPaymentData({
        contractId: '',
        clientId: '',
        amount: '',
        method: 'Transferencia',
        status: 'Pendiente',
        date: new Date().toLocaleDateString('es-MX'),
        recurring: false,
        recurrenceDays: '',
        accountName: '',
        accountNumber: ''
      });
    }
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'UNASSIGNED': return 'bg-orange-100 text-orange-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const renderPaymentCard = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-[20px] p-5 mb-4 shadow-sm border border-slate-100"
      activeOpacity={0.7}
      onPress={() => handleOpenPayment(item)}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-bold text-slate-500 text-xs uppercase">{item.contract_id || 'SIN CONTRATO'}</Text>
        <Text className="text-xl font-black text-slate-800">${item.amount}</Text>
      </View>
      
      {/* Body */}
      <View className="mb-4">
        <Text className="font-bold text-slate-800 text-base">{item.client_id || 'Cliente no asignado'}</Text>
      </View>
      
      {/* Footer */}
      <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-100">
        <Text className="text-xs text-slate-400 font-medium">{formatDate(item.created_at)}</Text>
        
        <View className="flex-row gap-2">
          <View className="bg-slate-100 px-3 py-1 rounded-full flex-row items-center">
            <CreditCard size={12} color="#64748b" className="mr-1" />
            <Text className="text-[10px] font-bold text-slate-500 uppercase">{item.payment_method || 'EFECTIVO'}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
            <Text className={`text-[10px] font-bold uppercase ${getStatusColor(item.status).split(' ')[1]}`}>
              {item.status || 'PENDING'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-black text-slate-800 mb-4">Pagos</Text>
        
        {/* Search */}
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-4">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 font-medium text-slate-800"
            placeholder="Buscar por cliente, contrato..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`mr-3 px-5 py-2.5 rounded-full ${activeFilter === filter ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}
            >
              <Text className={`font-bold text-xs ${activeFilter === filter ? 'text-white' : 'text-slate-500'}`}>
                {filter} {filter === 'TODOS' ? `(${payments.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderPaymentCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-10 mt-10">
              <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Receipt size={32} color="#94a3b8" />
              </View>
              <Text className="text-lg font-bold text-slate-800">No se encontraron pagos</Text>
              <Text className="text-slate-500 text-center mt-2">Prueba cambiando los filtros o la búsqueda.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => handleOpenPayment()}
        activeOpacity={0.8}
      >
        <Plus size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Payment Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView className="flex-1 bg-slate-50">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <View className="flex-row justify-between items-center p-4 border-b border-slate-200 bg-white">
              <Text className="text-xl font-black text-slate-800">
                {editingPayment ? 'Editar Pago' : 'Nuevo Registro de Pago'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-6">
              
              {/* Contrato / Cliente */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">ID Contrato / UPYA</Text>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                  value={paymentData.contractId} 
                  onChangeText={(t) => setPaymentData({...paymentData, contractId: t})} 
                  placeholder="-- Seleccionar Contrato --" 
                  editable={!editingPayment} 
                />
              </View>
              <View className="mb-6">
                <View className="flex-row justify-between items-end mb-2">
                  <Text className="text-xs font-bold text-slate-400 uppercase">Cliente Asociado</Text>
                  {!editingPayment && <Text className="text-xs font-bold text-blue-600">+ CREAR NUEVO CLIENTE</Text>}
                </View>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                  value={paymentData.clientId} 
                  onChangeText={(t) => setPaymentData({...paymentData, clientId: t})} 
                  placeholder="Seleccionar cliente..." 
                  editable={!editingPayment} 
                />
              </View>
              
              {/* Monto */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Monto ($)</Text>
                <TextInput 
                  className="bg-white border-2 border-slate-200 rounded-2xl p-4 font-black text-slate-800 text-lg" 
                  value={paymentData.amount} 
                  onChangeText={(t) => setPaymentData({...paymentData, amount: t})} 
                  keyboardType="numeric" 
                  placeholder="0" 
                />
              </View>
              
              {/* Método / Estado */}
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
              
              {/* Fecha de pago */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Fecha de pago</Text>
                <TextInput 
                  className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-slate-800" 
                  value={paymentData.date} 
                  editable={false} 
                />
              </View>

              {/* Recurrente */}
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

              {/* Datos de cuenta */}
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

              {/* Voucher at the end of the modal */}
              <TouchableOpacity className="bg-blue-300/50 rounded-2xl p-4 flex-row justify-center items-center border border-blue-400 mb-8" onPress={() => {}}>
                <FileText size={20} color="#64748b" className="mr-2" />
                <Text className="text-slate-500 font-black text-lg">Imprimir Voucher</Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View className="flex-row gap-4 mb-10 pb-10">
                <TouchableOpacity className="flex-1 bg-slate-100 rounded-2xl p-4 items-center justify-center" onPress={() => setModalVisible(false)}>
                  <Text className="text-slate-500 font-bold">Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-[2] bg-blue-600 rounded-2xl p-4 items-center justify-center" onPress={() => {
                  setModalVisible(false);
                  fetchPayments();
                }}>
                  <Text className="text-white font-black">Registrar Solicitud</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AgentPaymentsScreen;
