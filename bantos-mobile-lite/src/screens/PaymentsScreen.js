import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Zap, Wifi, Phone, Droplet } from 'lucide-react-native';

const SERVICES = [
  { id: '1', name: 'CFE', icon: Zap, color: '#f59e0b', bg: '#fef3c7' },
  { id: '2', name: 'Telmex', icon: Wifi, color: '#3b82f6', bg: '#dbeafe' },
  { id: '3', name: 'Agua', icon: Droplet, color: '#0ea5e9', bg: '#e0f2fe' },
  { id: '4', name: 'Recargas Telcel', icon: Phone, color: '#10b981', bg: '#d1fae5' },
];

export default function PaymentsScreen() {
  const renderItem = ({ item }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity className="bg-surface p-4 rounded-xl mb-3 flex-row items-center shadow-sm border border-gray-100">
        <View style={{ backgroundColor: item.bg }} className="p-3 rounded-full mr-4">
          <Icon size={24} color={item.color} />
        </View>
        <Text className="text-text font-medium text-lg flex-1">{item.name}</Text>
        <Text className="text-primary font-bold">Pagar</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-text mb-2">Pago de Servicios</Text>
        <Text className="text-textSecondary mb-6">Selecciona el servicio que deseas pagar</Text>
        
        <FlatList
          data={SERVICES}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
