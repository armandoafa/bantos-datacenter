import React from 'react';
import { View, Text, FlatList, Image, SafeAreaView } from 'react-native';

const PROMOS = [
  { id: '1', title: '20% en Telcel', description: 'Obtén 20% extra en tu próxima recarga de $100 o más.', image: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Promo+Telcel' },
  { id: '2', title: 'Descuento CFE', description: 'Paga tu recibo antes del día 10 y participa para ganar bonos.', image: 'https://via.placeholder.com/400x200/10b981/ffffff?text=Sorteo+CFE' },
];

export default function PromosScreen() {
  const renderItem = ({ item }) => (
    <View className="bg-surface rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      <Image source={{ uri: item.image }} className="w-full h-32" resizeMode="cover" />
      <View className="p-4">
        <Text className="text-lg font-bold text-text mb-1">{item.title}</Text>
        <Text className="text-textSecondary">{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-text mb-2">Promociones</Text>
        <Text className="text-textSecondary mb-6">Aprovecha nuestras ofertas exclusivas</Text>
        
        <FlatList
          data={PROMOS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
