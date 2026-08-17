import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Package, Search, ChevronRight, Smartphone, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const AgentProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const tenantId = await AsyncStorage.getItem('tenantId');
      const userStr = await AsyncStorage.getItem('user');
      if (!tenantId || !userStr) return;

      const user = JSON.parse(userStr);
      const queryParams = new URLSearchParams({
        tenantId,
        userId: user.id || '',
        role: user.role || '',
        scopeRole: user.scope?.role || ''
      });

      const response = await fetch(`https://bantos.cloud/datacenter-api/backoffice/products?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(q) || false;
    const modelMatch = p.model?.toLowerCase().includes(q) || false;
    
    return nameMatch || modelMatch;
  });

  const renderProductItem = ({ item }) => {
    return (
      <TouchableOpacity 
        onPress={() => setSelectedProduct(item)}
        className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-slate-100 flex-row items-center"
      >
        <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
          <Smartphone size={28} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800">{item.name || item.model || 'Producto'}</Text>
          <Text className="text-sm text-slate-500 mt-1">{item.type || 'Dispositivo'}</Text>
          
          <View className="flex-row items-center mt-2">
            <View className="bg-emerald-100 px-3 py-1 rounded-full self-start mr-2">
              <Text className="text-xs font-bold text-emerald-700">Disponibles: {item.stock_available || 0}</Text>
            </View>
            <Text className="text-sm font-bold text-slate-800">${item.base_value || item.total_cost || item.price || item.base_price || 0}</Text>
          </View>
        </View>
        <ChevronRight size={24} color="#cbd5e1" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-2">
        <Text className="text-2xl font-black text-slate-800">Productos</Text>
        <Text className="text-slate-500">Catálogo de equipos y planes</Text>
      </View>

      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
          <Search size={20} color="#94a3b8" />
          <TextInput 
            className="flex-1 ml-3 text-slate-800 font-medium p-0"
            placeholder="Buscar por modelo o nombre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : filteredProducts.length > 0 ? (
        <FlatList 
          data={filteredProducts}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderProductItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="bg-white rounded-[24px] p-8 items-center justify-center border border-slate-100 shadow-sm mt-10">
            <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-4">
              <Package size={32} color="#059669" />
            </View>
            <Text className="text-lg font-bold text-slate-800 mb-2">Catálogo vacío</Text>
            <Text className="text-slate-500 text-center mb-6">No hay productos asignados a tu cuenta en este momento.</Text>
          </View>
        </ScrollView>
      )}

      {/* Product Detail Modal */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent={true}>
        <View className="flex-1 bg-slate-900/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center flex-1">
                <View className="w-16 h-16 bg-emerald-50 rounded-2xl items-center justify-center mr-4 border border-emerald-100">
                  <Smartphone size={32} color="#059669" />
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-2xl font-black text-slate-800" numberOfLines={2}>{selectedProduct?.name || selectedProduct?.model}</Text>
                  <Text className="text-slate-500 font-bold">{selectedProduct?.type || 'Dispositivo'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedProduct(null)} className="p-2 bg-slate-100 rounded-full">
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4 mb-8">
              <View className="flex-row justify-between gap-4">
                <View className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Categoría</Text>
                  <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>{selectedProduct?.category || 'General'}</Text>
                </View>
                <View className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Fabricante</Text>
                  <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>{selectedProduct?.manufacturer || 'N/A'}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <View>
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Disponibles</Text>
                  <View className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center mt-1">
                    <Text className="text-emerald-700 font-bold text-sm">{selectedProduct?.stock_available || 0} Unidades</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Precio Total</Text>
                  <Text className="text-2xl font-black text-blue-700">${selectedProduct?.base_value || selectedProduct?.total_cost || selectedProduct?.price || selectedProduct?.base_price || 0}</Text>
                </View>
              </View>

              {selectedProduct?.description ? (
                <View className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Descripción</Text>
                  <Text className="text-slate-700">{selectedProduct.description}</Text>
                </View>
              ) : null}
            </View>

            <View className="mt-auto">
              <TouchableOpacity 
                className="bg-slate-800 p-4 rounded-2xl items-center justify-center w-full"
                onPress={() => setSelectedProduct(null)}
              >
                <Text className="text-white font-bold text-lg">Cerrar Detalles</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AgentProductsScreen;
