import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { CreditCard, Calendar, TrendingUp } from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-text mb-6">Mi Crédito</Text>

        <View className="bg-primary rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-primary-light font-medium mb-1">Balance Actual</Text>
          <Text className="text-white text-4xl font-bold mb-4">$4,500.00</Text>
          
          <View className="flex-row justify-between items-center border-t border-primary-light pt-4">
            <View>
              <Text className="text-primary-light text-xs">Límite Total</Text>
              <Text className="text-white font-medium">$10,000.00</Text>
            </View>
            <View>
              <Text className="text-primary-light text-xs">Disponible</Text>
              <Text className="text-white font-medium">$5,500.00</Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-bold text-text mb-4">Próximo Pago</Text>
        <View className="bg-surface rounded-xl p-4 flex-row items-center justify-between mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center space-x-3">
            <View className="bg-red-50 p-3 rounded-full">
              <Calendar size={24} color="#ef4444" />
            </View>
            <View>
              <Text className="text-text font-bold">15 de Julio, 2026</Text>
              <Text className="text-textSecondary text-sm">Pago Mínimo: $500.00</Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-bold text-text mb-4">Resumen de Actividad</Text>
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-gray-100 flex-row items-center space-x-3">
          <View className="bg-green-50 p-3 rounded-full">
            <TrendingUp size={24} color="#10b981" />
          </View>
          <View>
            <Text className="text-text font-bold">Último pago recibido</Text>
            <Text className="text-textSecondary text-sm">-$1,000.00 el 10 de Junio</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
