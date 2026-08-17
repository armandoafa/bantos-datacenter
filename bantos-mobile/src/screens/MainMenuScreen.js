import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Package, Users, ShoppingCart, FileText, CreditCard, 
  Smartphone, MapPin, Lock, Activity, RefreshCw 
} from 'lucide-react-native';

const MENU_ITEMS = [
  { id: 'SalesFlow', title: 'Nueva Venta', icon: ShoppingCart, color: 'bg-emerald-600' },
  { id: 'Contracts', title: 'Contratos', icon: FileText, color: 'bg-blue-600' },
  { id: 'Payments', title: 'Pagos', icon: CreditCard, color: 'bg-indigo-600' },
  { id: 'Clients', title: 'Clientes', icon: Users, color: 'bg-amber-500' },
  { id: 'Inventory', title: 'Inventario', icon: Package, color: 'bg-slate-700' },
  { id: 'Airtime', title: 'Tiempo Aire', icon: Smartphone, color: 'bg-teal-500' },
  { id: 'Services', title: 'Servicios', icon: MapPin, color: 'bg-orange-500' },
  { id: 'Trustonic', title: 'Trustonic', icon: Lock, color: 'bg-red-500' },
  { id: 'Audit', title: 'Auditoría', icon: Activity, color: 'bg-slate-500' },
  { id: 'Sync', title: 'Sync Local', icon: RefreshCw, color: 'bg-slate-800' },
];

const MainMenuScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <View className="p-6 bg-white border-b border-slate-200">
        <Text className="text-3xl font-black text-slate-800">Bantos Hub</Text>
        <Text className="text-slate-500 font-bold uppercase tracking-widest mt-1">Terminal Activa</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row flex-wrap justify-between">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity 
              key={item.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.id)}
              className="w-[48%] bg-white rounded-2xl p-6 mb-4 items-center border border-slate-200 shadow-sm"
              style={{ minHeight: 140, justifyContent: 'center' }}
            >
              <View className={`w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-sm ${item.color}`}>
                <item.icon size={32} color="#ffffff" />
              </View>
              <Text className="text-lg font-bold text-slate-800 text-center">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainMenuScreen;
