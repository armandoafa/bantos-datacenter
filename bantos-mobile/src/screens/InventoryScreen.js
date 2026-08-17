import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Search, Smartphone, X, CheckCircle2, AlertCircle } from 'lucide-react-native';
import POSButton from '../components/POSButton';

// Mock Data
const MOCK_INVENTORY = [
  { id: '1', brand: 'Samsung', model: 'Galaxy A54', imei: '358912345678901', status: 'Available', price: 6500, storage: '128GB', color: 'Graphite' },
  { id: '2', brand: 'Motorola', model: 'Moto G Stylus', imei: '358912345678902', status: 'Available', price: 4200, storage: '64GB', color: 'Blue' },
  { id: '3', brand: 'Apple', model: 'iPhone 13', imei: '358912345678903', status: 'Locked', price: 14000, storage: '128GB', color: 'Midnight' },
  { id: '4', brand: 'Samsung', model: 'Galaxy S23', imei: '358912345678904', status: 'Available', price: 18000, storage: '256GB', color: 'Phantom Black' },
  { id: '5', brand: 'Xiaomi', model: 'Redmi Note 12', imei: '358912345678905', status: 'Sold', price: 3800, storage: '128GB', color: 'Ice Blue' },
];

const StatusBadge = ({ status }) => {
  if (status === 'Available') {
    return (
      <View className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center">
        <CheckCircle2 size={14} color="#059669" className="mr-1" />
        <Text className="text-emerald-700 font-bold text-xs uppercase">Disponible</Text>
      </View>
    );
  }
  if (status === 'Locked') {
    return (
      <View className="bg-red-100 px-3 py-1 rounded-full flex-row items-center">
        <AlertCircle size={14} color="#dc2626" className="mr-1" />
        <Text className="text-red-700 font-bold text-xs uppercase">Bloqueado</Text>
      </View>
    );
  }
  return (
    <View className="bg-slate-200 px-3 py-1 rounded-full flex-row items-center">
      <Text className="text-slate-600 font-bold text-xs uppercase">{status}</Text>
    </View>
  );
};

const InventoryScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Filter logic: IMEI, Brand, or Model
  const filteredData = useMemo(() => {
    if (!search) return MOCK_INVENTORY;
    const lowerSearch = search.toLowerCase();
    return MOCK_INVENTORY.filter(item => 
      item.imei.includes(lowerSearch) || 
      item.brand.toLowerCase().includes(lowerSearch) || 
      item.model.toLowerCase().includes(lowerSearch)
    );
  }, [search]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => setSelectedDevice(item)}
      className="bg-white p-5 rounded-2xl mb-4 border border-slate-200 flex-row items-center shadow-sm"
    >
      <View className="w-14 h-14 bg-slate-100 rounded-xl items-center justify-center mr-4">
        <Smartphone size={28} color="#475569" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-black text-slate-800">{item.brand} {item.model}</Text>
        <Text className="text-sm font-mono text-slate-500 mt-1">IMEI: {item.imei}</Text>
      </View>
      <View className="items-end">
        <StatusBadge status={item.status} />
        <Text className="text-blue-700 font-black mt-2">${item.price.toFixed(2)}</Text>
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
            placeholder="Buscar por IMEI, Marca o Modelo..."
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
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center p-10">
              <Text className="text-slate-400 text-lg font-bold">No se encontraron dispositivos</Text>
            </View>
          }
        />
      </View>

      {/* Device Detail Modal */}
      <Modal visible={!!selectedDevice} animationType="slide" transparent={true}>
        <View className="flex-1 bg-slate-900/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center flex-1">
                <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mr-4 border border-blue-100">
                  <Smartphone size={32} color="#1d4ed8" />
                </View>
                <View>
                  <Text className="text-2xl font-black text-slate-800">{selectedDevice?.brand} {selectedDevice?.model}</Text>
                  <Text className="text-slate-500 font-bold">Detalles del Dispositivo</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedDevice(null)} className="p-2 bg-slate-100 rounded-full">
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4 mb-8">
              <View className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">IMEI</Text>
                <Text className="text-xl font-mono font-bold text-slate-800">{selectedDevice?.imei}</Text>
              </View>

              <View className="flex-row justify-between gap-4">
                <View className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Almacenamiento</Text>
                  <Text className="text-lg font-bold text-slate-800">{selectedDevice?.storage}</Text>
                </View>
                <View className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Color</Text>
                  <Text className="text-lg font-bold text-slate-800">{selectedDevice?.color}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <View>
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Estado en Sistema</Text>
                  <StatusBadge status={selectedDevice?.status} />
                </View>
                <View className="items-end">
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Precio Base</Text>
                  <Text className="text-2xl font-black text-blue-700">${selectedDevice?.price?.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-4 mt-auto">
              {selectedDevice?.status === 'Available' && (
                <View className="flex-1">
                  <POSButton 
                    title="Vender Equipo" 
                    variant="success" 
                    onPress={() => {
                      alert('Iniciando flujo de venta...');
                      setSelectedDevice(null);
                    }} 
                  />
                </View>
              )}
              <View className={selectedDevice?.status === 'Available' ? 'w-1/3' : 'w-full'}>
                <POSButton title="Cerrar" variant="secondary" onPress={() => setSelectedDevice(null)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default InventoryScreen;
