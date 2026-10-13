import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  onLogout: () => void;
}

export default function CustomerHomeScreen({ onLogout }: Props) {
  return (
    <View className="flex-1 justify-center items-center bg-white px-5">
      <Text className="text-2xl font-bold text-[#001F3F] mb-2">
        Customer Home
      </Text>
      <Text className="text-[#4D78A3] mb-8 text-center">
        Welcome! You are logged in as a Customer.
      </Text>

      <TouchableOpacity 
        onPress={onLogout}
        className="bg-red-500 py-3 px-6 rounded-xl"
      >
        <Text className="text-white font-bold">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}