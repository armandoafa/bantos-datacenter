import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Trash2, Plus, Minus } from 'lucide-react-native';
import POSButton from './POSButton';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => (
  <View className="flex-row items-center justify-between p-3 border-b border-slate-200 bg-white">
    <View className="flex-1">
      <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>{item.name}</Text>
      <Text className="text-slate-500">${item.price.toFixed(2)}</Text>
    </View>
    
    <View className="flex-row items-center bg-slate-100 rounded-lg p-1">
      <TouchableOpacity onPress={() => onDecrease(item)} className="p-2">
        <Minus size={20} color="#64748b" />
      </TouchableOpacity>
      <Text className="mx-3 text-lg font-bold min-w-[20px] text-center">{item.quantity}</Text>
      <TouchableOpacity onPress={() => onIncrease(item)} className="p-2">
        <Plus size={20} color="#1d4ed8" />
      </TouchableOpacity>
    </View>
    
    <Text className="text-lg font-bold text-slate-800 ml-4 w-16 text-right">
      ${(item.price * item.quantity).toFixed(2)}
    </Text>
  </View>
);

const CartPanel = ({ cartItems, onIncrease, onDecrease, onRemove, onCheckout, onClear }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <View className="flex-1 bg-slate-50 border-t border-slate-200">
      <View className="p-4 bg-white border-b border-slate-200 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-slate-800">Orden Actual</Text>
        <TouchableOpacity onPress={onClear} className="p-2" disabled={cartItems.length === 0}>
          <Trash2 size={24} color={cartItems.length === 0 ? "#cbd5e1" : "#ef4444"} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CartItem 
            item={item} 
            onIncrease={onIncrease} 
            onDecrease={onDecrease} 
            onRemove={onRemove} 
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-slate-400 text-lg text-center">No hay productos en la orden.</Text>
          </View>
        }
        className="flex-1"
      />

      <View className="p-4 bg-white border-t border-slate-200 shadow-lg">
        <View className="flex-row justify-between mb-4">
          <Text className="text-xl text-slate-600">Total:</Text>
          <Text className="text-3xl font-black text-slate-800">${total.toFixed(2)}</Text>
        </View>
        <POSButton 
          title={`Cobrar $${total.toFixed(2)}`} 
          onPress={onCheckout} 
          size="huge" 
          variant="success" 
          disabled={cartItems.length === 0} 
        />
      </View>
    </View>
  );
};

export default CartPanel;
