import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Modal } from 'react-native';
import { FileText, Search, X, Calendar, User, Smartphone, CreditCard } from 'lucide-react-native';

const MOCK_CONTRACTS = [
  { id: 'CTR-001', date: '2026-06-10 10:30', client: 'Armando Fernández', device: 'Samsung Galaxy A54', plan: '12 Meses PAYG', amount: 1500, status: 'Active' },
  { id: 'CTR-002', date: '2026-06-09 16:45', client: 'María González', device: 'Moto G Stylus', plan: '6 Meses PAYG', amount: 2000, status: 'Active' },
  { id: 'CTR-003', date: '2026-06-08 12:15', client: 'Juan Pérez', device: 'iPhone 13', plan: 'Contado', amount: 12000, status: 'Completed' },
  { id: 'CTR-004', date: '2026-06-07 09:00', client: 'Ana López', device: 'Xiaomi Redmi Note 12', plan: '12 Meses PAYG', amount: 1200, status: 'Active' },
];

const ContractsScreen = ({ navigation }) => {
  const [selectedContract, setSelectedContract] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const renderContractDetails = () => {
    if (!selectedContract) return null;
    
    return (
      <Modal transparent visible={!!selectedContract} animationType="slide">
        <View className="flex-1 bg-slate-900/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">Detalles de Contrato</Text>
              <TouchableOpacity onPress={() => setSelectedContract(null)} className="p-2 bg-slate-100 rounded-full">
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <FileText color="#94a3b8" className="mr-4" />
                <View>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">Folio</Text>
                  <Text className="font-bold text-slate-800">{selectedContract.id}</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <User color="#94a3b8" className="mr-4" />
                <View>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</Text>
                  <Text className="font-bold text-slate-800">{selectedContract.client}</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Smartphone color="#94a3b8" className="mr-4" />
                <View>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dispositivo y Plan</Text>
                  <Text className="font-bold text-slate-800">{selectedContract.device}</Text>
                  <Text className="text-sm text-slate-500">{selectedContract.plan}</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <CreditCard color="#94a3b8" className="mr-4" />
                <View>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cobro Inicial</Text>
                  <Text className="font-black text-emerald-600 text-xl">${selectedContract.amount}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setSelectedContract(null)}
              className="mt-8 bg-blue-600 h-16 rounded-xl items-center justify-center"
            >
              <Text className="text-white font-bold text-xl">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 bg-white border-b border-slate-200 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-black text-slate-800">Contratos</Text>
          <Text className="text-slate-500 font-bold uppercase tracking-widest mt-1 text-xs">Historial de Ventas</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
          <X color="#64748b" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={MOCK_CONTRACTS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({item}) => (
          <TouchableOpacity 
            onPress={() => setSelectedContract(item)}
            className="bg-white p-5 rounded-2xl mb-4 border border-slate-200 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center">
                <FileText size={20} color="#cbd5e1" className="mr-2" />
                <Text className="font-bold text-slate-800 text-lg">{item.id}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                <Text className="text-xs font-bold uppercase">{item.status}</Text>
              </View>
            </View>
            
            <Text className="text-slate-600 font-bold mb-1">{item.client}</Text>
            <Text className="text-slate-500 text-sm mb-3">{item.device}</Text>
            
            <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
              <View className="flex-row items-center">
                <Calendar size={14} color="#94a3b8" className="mr-1" />
                <Text className="text-xs text-slate-400 font-bold">{item.date}</Text>
              </View>
              <Text className="text-emerald-600 font-black">${item.amount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {renderContractDetails()}
    </SafeAreaView>
  );
};

export default ContractsScreen;
