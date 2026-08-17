import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState('c-romel');

  const handleLogin = () => {
    // Basic validation mockup
    if (username && password && tenant) {
      navigation.replace('MainTabs');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-center px-6">
      <View className="mb-10 items-center">
        <Text className="text-3xl font-bold text-primary">Bantos Lite</Text>
        <Text className="text-textSecondary mt-2">Inicia sesión en tu cuenta</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-text mb-1">Tenant / Organización</Text>
          <TextInput
            className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-text"
            placeholder="Ej: c-romel"
            value={tenant}
            onChangeText={setTenant}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-text mb-1">Usuario / Correo</Text>
          <TextInput
            className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-text"
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-text mb-1">Contraseña</Text>
          <TextInput
            className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-text"
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-primary py-4 rounded-xl items-center mt-4"
          onPress={handleLogin}
        >
          <Text className="text-white font-bold text-base">Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
