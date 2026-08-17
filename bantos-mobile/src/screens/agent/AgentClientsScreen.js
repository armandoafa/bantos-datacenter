import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Users, Search, ChevronRight, User, X, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const AgentClientsScreen = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [clientData, setClientData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchClients();
    }
  }, [isFocused]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const tenantId = await AsyncStorage.getItem('tenantId');
      const userStr = await AsyncStorage.getItem('user');
      if (!tenantId || !userStr) return;

      const user = JSON.parse(userStr);
      const queryParams = new URLSearchParams({
        tenantId,
        storeId: user.storeId || '',
        role: 'manager', // Workaround to view all store clients, as backend restricts agent to only 'agent = username'
        username: user.username || ''
      });

      const response = await fetch(`https://bantos.cloud/datacenter-api/backoffice/clients?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewClient = () => {
    setSelectedClient(null);
    setClientData({ first_name: '', last_name: '', email: '', phone: '', address: '' });
    setModalVisible(true);
  };

  const openEditClient = (client) => {
    setSelectedClient(client);
    setClientData({
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || client.street_address || ''
    });
    setModalVisible(true);
  };

  const handleSaveClient = async () => {
    if (!clientData.first_name || !clientData.last_name || !clientData.phone) {
      Alert.alert('Error', 'Por favor ingresa nombre, apellidos y teléfono.');
      return;
    }
    
    setSaving(true);
    try {
      // Simulación de guardado a API (se puede reemplazar por la lógica real de guardado)
      setTimeout(() => {
        Alert.alert('Éxito', selectedClient ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.');
        setModalVisible(false);
        fetchClients(); // recargar
        setSaving(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al guardar el cliente.');
      setSaving(false);
    }
  };

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(q) || false;
    const firstMatch = c.first_name?.toLowerCase().includes(q) || false;
    const lastMatch = c.last_name?.toLowerCase().includes(q) || false;
    const emailMatch = c.email?.toLowerCase().includes(q) || false;
    const phoneMatch = c.phone?.toLowerCase().includes(q) || false;
    
    return nameMatch || firstMatch || lastMatch || emailMatch || phoneMatch;
  });

  const renderClientItem = ({ item }) => {
    const fullName = item.name || (item.first_name || item.last_name ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : 'Sin Nombre');
    
    return (
      <TouchableOpacity 
        onPress={() => openEditClient(item)}
        className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-slate-100 flex-row items-center"
      >
        <View className="w-12 h-12 bg-amber-50 rounded-full items-center justify-center mr-4">
          <User size={24} color="#d97706" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800">{fullName}</Text>
          <Text className="text-sm text-slate-500 mt-1">{item.email || 'Sin correo'}</Text>
          <Text className="text-sm text-slate-500">{item.phone || 'Sin teléfono'}</Text>
        </View>
        <ChevronRight size={24} color="#cbd5e1" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-black text-slate-800">Clientes</Text>
          <Text className="text-slate-500">Cartera de clientes registrados</Text>
        </View>
        <TouchableOpacity 
          onPress={openNewClient}
          className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center shadow-sm shadow-blue-600/30"
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
          <Search size={20} color="#94a3b8" />
          <TextInput 
            className="flex-1 ml-3 text-slate-800 font-medium p-0"
            placeholder="Buscar por nombre, correo, teléfono..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : filteredClients.length > 0 ? (
        <FlatList 
          data={filteredClients}
          keyExtractor={(item) => item.id?.toString() || item.upya_id || Math.random().toString()}
          renderItem={renderClientItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="bg-white rounded-[24px] p-8 items-center justify-center border border-slate-100 shadow-sm mt-10">
            <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center mb-4">
              <Users size={32} color="#d97706" />
            </View>
            <Text className="text-lg font-bold text-slate-800 mb-2">Cartera vacía</Text>
            <Text className="text-slate-500 text-center mb-6">Tus clientes registrados aparecerán aquí.</Text>
          </View>
        </ScrollView>
      )}

      {/* Client Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-900/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[85%]">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center flex-1">
                <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mr-4 border border-blue-100">
                  <User size={32} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-2xl font-black text-slate-800">{selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}</Text>
                  <Text className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                    {selectedClient ? selectedClient.upya_id || 'ID Desconocido' : 'Registro manual'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 space-y-4" showsVerticalScrollIndicator={false}>
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nombre(s)</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800"
                    value={clientData.first_name}
                    onChangeText={(t) => setClientData({...clientData, first_name: t})}
                    placeholder="Ej. Juan"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Apellidos</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800"
                    value={clientData.last_name}
                    onChangeText={(t) => setClientData({...clientData, last_name: t})}
                    placeholder="Ej. Pérez"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Teléfono</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800"
                  value={clientData.phone}
                  onChangeText={(t) => setClientData({...clientData, phone: t})}
                  keyboardType="phone-pad"
                  placeholder="Ej. 5551234567"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Correo Electrónico (Opcional)</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800"
                  value={clientData.email}
                  onChangeText={(t) => setClientData({...clientData, email: t})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="ejemplo@correo.com"
                />
              </View>

              <View className="mb-8">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dirección (Opcional)</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 h-24"
                  value={clientData.address}
                  onChangeText={(t) => setClientData({...clientData, address: t})}
                  multiline
                  textAlignVertical="top"
                  placeholder="Dirección completa"
                />
              </View>
            </ScrollView>

            <View className="mt-4 pt-4 border-t border-slate-100">
              <TouchableOpacity 
                onPress={handleSaveClient}
                disabled={saving}
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-600/30 ${saving ? 'bg-slate-400' : 'bg-blue-600'}`}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-black text-lg uppercase tracking-widest">
                    {selectedClient ? 'Guardar Cambios' : 'Crear Cliente'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default AgentClientsScreen;
