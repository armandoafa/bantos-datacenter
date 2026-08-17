import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Plus, ShoppingCart } from 'lucide-react-native';

const AgentSalesScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-6">
          <Text className="text-2xl font-black text-slate-800">Tus Ventas</Text>
          <Text className="text-slate-500">Resumen de tus operaciones</Text>
        </View>
        
        {/* Empty state for MVP */}
        <View className="bg-white rounded-[24px] p-8 items-center justify-center border border-slate-100 shadow-sm mt-10">
          <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
            <ShoppingCart size={32} color="#2563eb" />
          </View>
          <Text className="text-lg font-bold text-slate-800 mb-2">Sin ventas recientes</Text>
          <Text className="text-slate-500 text-center mb-6">Comienza una nueva solicitud de venta para registrar a un cliente.</Text>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('SalesWizard')}
        activeOpacity={0.8}
      >
        <Plus size={32} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AgentSalesScreen;
