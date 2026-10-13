import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  

} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface RiderHomeScreenNext{
  onRiderinfo_1: () => void;
}

export default function RiderHomeScreen({
 onRiderinfo_1,
}:RiderHomeScreenNext) {
  return (
    <SafeAreaView  className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Logo / Brand */}
        <View className="flex-row items-center justify-center mt-8">
          <Image
            className="w-14 h-14 mr-2"
            resizeMode="contain"
            source={require('../../assets/codaexpress-logo.png')}
          />

          <Text className="font-bold text-3xl text-[#001F3F]">
            Coda
            <Text className="text-[#E11D48]">Express</Text>
          </Text>
        </View>

        {/* Main Content */}
        <View className="px-7 mt-14">
          {/* Heading */}
          <Text className="text-[42px] leading-[48px] font-bold text-[#001F3F]">
            Welcome to{'\n'}
            CodaExpress!
          </Text>

          {/* Description */}
          <Text className="text-lg leading-7 font-medium text-gray-500 mt-5">
            You're almost ready to start earning. Let's set up your rider
            profile and get you ready for your first delivery.
          </Text>

          {/* Illustration */}
          <View className="items-center mt-8">
            <Image
              className="w-full h-72"
              resizeMode="contain"
              source={require('../../assets/CodaExpress_login_rider_illustration.png')}
            />
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={onRiderinfo_1}
            activeOpacity={0.8}
            className="w-full h-14 bg-[#E11D48] rounded-xl items-center justify-center mt-7 shadow-sm"
          >
            <Text className="text-white text-lg font-bold">
              Get Started
            </Text>
          </TouchableOpacity>

          {/* Small helper text */}
          <Text className="text-center text-sm text-gray-400 mt-4">
            It only takes a few minutes to complete your profile.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}