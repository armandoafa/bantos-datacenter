import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import ProductGrid from '../components/ProductGrid';
import CartPanel from '../components/CartPanel';

// Mock data for initial testing
const MOCK_PRODUCTS = [
  { id: 1, name: 'Coca Cola 600ml', price: 18.50 },
  { id: 2, name: 'Gansito Marinela', price: 22.00 },
  { id: 3, name: 'Agua Ciel 1L', price: 15.00 },
  { id: 4, name: 'Sabritas Sal 40g', price: 17.00 },
  { id: 5, name: 'Trident Menta', price: 10.00 },
  { id: 6, name: 'Café Andatti 12oz', price: 25.00 },
];

const POSDashboard = () => {
  const [cart, setCart] = useState([]);

  const handleAddProduct = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleIncrease = (product) => {
    setCart(prev => prev.map(item => 
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrease = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing.quantity === 1) {
        return prev.filter(item => item.id !== product.id);
      }
      return prev.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handleClear = () => setCart([]);
  const handleCheckout = () => {
    alert("Procesando pago en terminal Datecs...");
    setCart([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 flex-col">
      <View className="flex-[3]">
        <ProductGrid products={MOCK_PRODUCTS} onProductPress={handleAddProduct} />
      </View>
      <View className="flex-[2]">
        <CartPanel 
          cartItems={cart} 
          onIncrease={handleIncrease} 
          onDecrease={handleDecrease}
          onClear={handleClear}
          onCheckout={handleCheckout}
        />
      </View>
    </SafeAreaView>
  );
};

export default POSDashboard;
