import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShoppingCart, Package, Users, Banknote } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AgentSalesScreen from '../screens/agent/AgentSalesScreen';
import AgentProductsScreen from '../screens/agent/AgentProductsScreen';
import AgentClientsScreen from '../screens/agent/AgentClientsScreen';
import AgentPaymentsScreen from '../screens/agent/AgentPaymentsScreen';

const Tab = createBottomTabNavigator();

const AgentTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#1e293b',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: { 
          backgroundColor: '#ffffff', 
          borderTopWidth: 1, 
          borderTopColor: '#e2e8f0',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom - 5 : 0)
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen 
        name="VentasTab" 
        component={AgentSalesScreen} 
        options={{ 
          title: 'Ventas',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="ProductosTab" 
        component={AgentProductsScreen} 
        options={{ 
          title: 'Productos',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="ClientesTab" 
        component={AgentClientsScreen} 
        options={{ 
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="PagosTab" 
        component={AgentPaymentsScreen} 
        options={{ 
          title: 'Pagos',
          tabBarIcon: ({ color, size }) => <Banknote color={color} size={size} /> 
        }} 
      />
    </Tab.Navigator>
  );
};

export default AgentTabs;
