import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Search, Users, X, CreditCard, CheckCircle2, AlertCircle, Plus, RefreshCw } from 'lucide-react-native';
import POSButton from '../components/POSButton';

// Mock Data
const MOCK_CLIENTS = [
  { upya_id: 'C-0001', name: 'Armando Fernández', email: 'armando@bantos.com', status: 'ACTIVE', clabe: '646180111812345678' },
  { upya_id: 'C-0002', name: 'María González', email: 'maria.g@gmail.com', status: 'PENDING', clabe: null },
  { upya_id: 'C-0003', name: 'Juan Pérez', email: 'jperez@empresa.mx', status: 'ACTIVE', clabe: '646180111898765432' },
  { upya_id: 'C-0004', name: 'Lucía Torres', email: null, status: 'REJECTED', clabe: null },
  { upya_id: 'C-0005', name: 'Roberto Díaz', email: 'robdiaz@yahoo.com', status: 'ACTIVE', clabe: null },
];

const StatusBadge = ({ status }) => {
  const isOk = ['ACTIVE', 'VALIDATED'].includes(status);
  const isPending = ['PENDING'].includes(status);
  
  if (isOk) {
    return (
      <View className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center">
        <CheckCircle2 size={12} color="#059669" className="mr-1" />
        <Text className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest">{status}</Text>
      </View>
    );
  }
  if (isPending) {
    return (
      <View className="bg-amber-100 px-3 py-1 rounded-full flex-row items-center">
        <RefreshCw size={12} color="#d97706" className="mr-1" />
        <Text className="text-amber-700 font-bold text-[10px] uppercase tracking-widest">{status}</Text>
      </View>
    );
  }
  return (
    <View className="bg-red-100 px-3 py-1 rounded-full flex-row items-center">
      <AlertCircle size={12} color="#dc2626" className="mr-1" />
      <Text className="text-red-700 font-bold text-[10px] uppercase tracking-widest">{status}</Text>
    </View>
  );
};

const ClientsScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);

  // Filter logic: Name, ID, or Email
  const filteredData = useMemo(() => {
    if (!search) return MOCK_CLIENTS;
    const lowerSearch = search.toLowerCase();
    return MOCK_CLIENTS.filter(item => 
      item.name.toLowerCase().includes(lowerSearch) || 
      item.upya_id.toLowerCase().includes(lowerSearch) || 
      (item.email && item.email.toLowerCase().includes(lowerSearch))
    );
  }, [search]);

  const handleGenerateWallet = () => {
    setIsGeneratingWallet(true);
    // Simulate API call
    setTimeout(() => {
      setSelectedClient(prev => ({ ...prev, clabe: '646180' + Math.floor(100000000000 + Math.random() * 900000000000) }));
      setIsGeneratingWallet(false);
      alert('Wallet STP generada exitosamente.');
    }, 1500);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => setSelectedClient(item)}
      className="bg-white p-5 rounded-2xl mb-4 border border-slate-200 flex-row items-center shadow-sm"
    >
      <View className="w-14 h-14 bg-amber-50 rounded-xl items-center justify-center mr-4 border border-amber-100">
        <Users size={28} color="#d97706" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-black text-slate-800">{item.name}</Text>
        <Text className="text-sm font-mono text-blue-600 font-bold">{item.upya_id}</Text>
      </View>
      <View className="items-end gap-2">
        <StatusBadge status={item.status} />
        {item.clabe ? (
          <View className="bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            <Text className="text-[10px] font-black text-emerald-600 uppercase">STP OK</Text>
          </View>
        ) : (
          <Text className="text-[10px] font-bold text-slate-400 uppercase">Sin Wallet</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-4">
        {/* Search Bar */}
        <View className="bg-white flex-row items-center px-4 py-3 rounded-2xl border border-slate-200 shadow-sm mb-4">
          <Search size={24} color="#94a3b8" />
          <TextInput 
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por Nombre o ID..."
            className="flex-1 ml-3 text-lg font-bold text-slate-800"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={24} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <FlatList 
          data={filteredData}
          keyExtractor={item => item.upya_id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center p-10">
              <Text className="text-slate-400 text-lg font-bold">No se encontraron clientes</Text>
            </View>
          }
        />
      </View>

      {/* Client Detail Modal */}
      <Modal visible={!!selectedClient} animationType="slide" transparent={true}>
        <View className="flex-1 bg-slate-900/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%] flex-col">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center flex-1">
                <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-blue-600/30">
                  <Users size={32} color="#ffffff" />
                </View>
                <View>
                  <Text className="text-2xl font-black text-slate-800">{selectedClient?.name}</Text>
                  <Text className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Detalles del Cliente</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedClient(null)} className="p-2 bg-slate-100 rounded-full">
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4 mb-6">
              <View className="flex-row gap-4">
                <View className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">ID Upya</Text>
                  <Text className="text-lg font-mono font-bold text-blue-600">{selectedClient?.upya_id}</Text>
                </View>
                <View className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 items-start">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Estado</Text>
                  <StatusBadge status={selectedClient?.status || 'PENDING'} />
                </View>
              </View>

              <View className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Correo Electrónico</Text>
                <Text className="text-lg font-bold text-slate-800">{selectedClient?.email || 'No registrado'}</Text>
              </View>

              {/* Wallet Section */}
              <View className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mt-2">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="w-8 h-8 bg-emerald-100 rounded-lg items-center justify-center">
                    <CreditCard size={16} color="#059669" />
                  </View>
                  <Text className="font-black text-slate-800">Wallet STP DynamiCore</Text>
                </View>

                {selectedClient?.clabe ? (
                  <View className="bg-white border border-emerald-200 rounded-xl p-4 items-center">
                    <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">CLABE Interbancaria</Text>
                    <Text className="text-2xl font-mono font-black text-emerald-700">{selectedClient.clabe}</Text>
                  </View>
                ) : (
                  <View className="items-center py-2">
                    <Text className="text-slate-500 text-center text-sm mb-4">
                      Este cliente no tiene una CLABE asignada. Genérela para recibir pagos referenciados.
                    </Text>
                    <TouchableOpacity 
                      onPress={handleGenerateWallet}
                      disabled={isGeneratingWallet}
                      className={`w-full bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-600/30 ${isGeneratingWallet ? 'opacity-70' : ''}`}
                    >
                      {isGeneratingWallet ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <>
                          <Plus size={20} color="#ffffff" />
                          <Text className="text-white font-black text-sm uppercase tracking-widest ml-2">Generar Wallet</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View className="mt-auto">
              <POSButton title="Cerrar Ficha" variant="secondary" onPress={() => setSelectedClient(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ClientsScreen;
