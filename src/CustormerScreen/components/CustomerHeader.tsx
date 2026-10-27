import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

// Import your LocationPicker component (adjust path if needed)
import LocationPicker from './LocationPicker'; 

interface Props {
  onLogout?: () => void;
  walletBalance?: string;
  onTopUpPress?: () => void;
  onNotificationPress?: () => void;
}

export default function CustomerHeader({
  onLogout,
  walletBalance = "₦15,400",
  onTopUpPress,
  onNotificationPress,
}: Props) {
  // State for the location dropdown
  const [selectedLocation, setSelectedLocation] = useState("Lagos, Nigeria");

  return (
    <SafeAreaView edges={['top']} className="bg-darkHeader border-b border-darkBorder px-4 py-2">
      
      {/* Top Row: Brand Logo & Action Buttons */}
      <View className="flex-row items-center justify-between mb-2">
        
        {/* Left: Brand Logo & Name */}
        <View className="flex-row items-center space-x-2">
          <Image
            source={require('../../../assets/codaexpress-logo.png')}
            className="w-12 h-12"
            resizeMode="contain"
          />
          <Text className="text-white text-3xl font-black tracking-tight">
            Coda<Text className="text-brand">Express</Text>
          </Text>
        </View>

        {/* Right: Actions (Notification & Wallet Pill) */}
        <View className="flex-row items-center space-x-3">
          
          {/* Notification Bell */}
          <TouchableOpacity 
            onPress={onNotificationPress}
            className="w-10 m-1 h-10 rounded-full bg-darkCard border border-darkBorder items-center justify-center"
            activeOpacity={0.7}
          >
            <AntDesign name="bell" size={20} color="#FFFFFF" />
            {/* Optional Notification Dot */}
            <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand" />
          </TouchableOpacity>

          {/* Wallet Escrow Pill */}
          <TouchableOpacity
            onPress={onTopUpPress}
            className="flex-row items-center bg-darkCard border border-darkBorder px-3 py-1.5 rounded-full space-x-2"
            activeOpacity={0.8}
          >
            <Image
              source={require('../../../assets/codaexpress-logo.png')}
              className="w-5 h-5"
              resizeMode="contain"
            />
            <Text className="text-white font-bold text-sm tracking-wide">
              {walletBalance}
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Location Picker Pill (Placed right below the logo row, matching your design layout!) */}
      <View className="pb-1 ">
        <LocationPicker
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
        />
      </View>

    </SafeAreaView>
  );
}