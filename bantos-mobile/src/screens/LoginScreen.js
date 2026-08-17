import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password || !tenantId) {
      Alert.alert('Error', 'Por favor ingresa usuario, contraseña y el identificador del tenant (empresa)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://bantos.cloud/datacenter-api/backoffice/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, tenantId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Validate role is agent
        const role = data.user?.role?.toLowerCase() || '';
        const scopeRole = data.user?.scope?.role?.toLowerCase() || '';
        
        if (role === 'agent' || role === 'agente' || scopeRole === 'agent' || scopeRole === 'agente') {
          // Success
          await AsyncStorage.setItem('tenantId', tenantId);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          setLoading(false);
          navigation.replace('MainMenu');
        } else {
          setLoading(false);
          Alert.alert('Acceso Denegado', 'Esta aplicación es exclusiva para el rol de Agente.');
        }
      } else {
        setLoading(false);
        Alert.alert('Error', data.message || 'Credenciales o Tenant incorrectos');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo conectar con el servidor de Bantos');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center px-6"
      >
        <View className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-2xl font-black">B</Text>
            </View>
            <Text className="text-3xl font-black text-slate-800">Bantos Hub</Text>
            <Text className="text-slate-500 mt-2 font-medium">Acceso para Agentes</Text>
          </View>

          <View className="space-y-4 mb-8">
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">ID del Tenant (Empresa)</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="Ej. c-romel"
                value={tenantId}
                onChangeText={setTenantId}
                autoCapitalize="none"
              />
            </View>
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Usuario o Teléfono</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="Ej. admin"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Contraseña</Text>
              <View className="relative">
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-800 font-medium"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            className="bg-blue-600 rounded-2xl p-4 items-center justify-center flex-row shadow-sm"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
