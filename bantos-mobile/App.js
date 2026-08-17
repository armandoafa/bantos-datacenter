import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import AgentTabs from './src/navigation/AgentTabs';
import SalesFlowScreen from './src/screens/SalesFlowScreen';
import ContractsScreen from './src/screens/ContractsScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AirtimeScreen from './src/screens/AirtimeScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import AuditScreen from './src/screens/AuditScreen';
import SyncScreen from './src/screens/SyncScreen';
import TrustonicScreen from './src/screens/TrustonicScreen';
import AgentSalesWizardScreen from './src/screens/agent/AgentSalesWizardScreen';
import AgentNewPaymentWizardScreen from './src/screens/agent/AgentNewPaymentWizardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: true, // We show headers for inner screens to allow going back
          headerBackTitleVisible: false,
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTintColor: '#1e293b',
          headerTitleStyle: { fontWeight: 'bold' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false, animation: 'fade' }} 
        />
        <Stack.Screen 
          name="MainMenu" 
          component={AgentTabs} 
          options={{ headerShown: false, animation: 'fade' }} 
        />
        <Stack.Screen name="SalesWizard" component={AgentSalesWizardScreen} options={{ title: 'Nueva Venta' }} />
        <Stack.Screen name="NewPaymentWizard" component={AgentNewPaymentWizardScreen} options={{ title: 'Registrar Pago' }} />
        <Stack.Screen name="SalesFlow" component={SalesFlowScreen} options={{ title: 'Nueva Venta' }} />
        <Stack.Screen name="Contracts" component={ContractsScreen} options={{ title: 'Contratos' }} />
        <Stack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Pagos' }} />
        <Stack.Screen name="Clients" component={ClientsScreen} options={{ title: 'Clientes' }} />
        <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventario' }} />
        <Stack.Screen name="Airtime" component={AirtimeScreen} options={{ title: 'Tiempo Aire' }} />
        <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Servicios' }} />
        <Stack.Screen name="Trustonic" component={TrustonicScreen} options={{ title: 'Comandos Trustonic' }} />
        <Stack.Screen name="Audit" component={AuditScreen} options={{ title: 'Auditoría' }} />
        <Stack.Screen name="Sync" component={SyncScreen} options={{ title: 'Sincronización Local' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
