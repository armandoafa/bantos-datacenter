import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity 
    onPress={() => onPress(product)}
    activeOpacity={0.7}
    className="bg-white rounded-2xl p-4 m-2 flex-1 items-center justify-center border border-slate-200 shadow-sm min-h-[140px]"
  >
    {product.image ? (
      <Image source={{ uri: product.image }} className="w-16 h-16 rounded-lg mb-2" />
    ) : (
      <View className="w-16 h-16 rounded-lg bg-slate-100 items-center justify-center mb-2">
        <Text className="text-2xl font-bold text-slate-300">{product.name.charAt(0)}</Text>
      </View>
    )}
    <Text className="text-center font-bold text-slate-800 mb-1" numberOfLines={2}>
      {product.name}
    </Text>
    <Text className="text-blue-700 font-black text-lg">
      ${product.price.toFixed(2)}
    </Text>
  </TouchableOpacity>
);

const ProductGrid = ({ products, onProductPress }) => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={onProductPress} />
      )}
    />
  );
};

export default ProductGrid;
