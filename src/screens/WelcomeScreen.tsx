import React, { useState, useEffect } from 'react';

import {
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Carousel images
const carouselImages = [
  require('../../assets/bike-man-on-rider.png'),
];

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
}) => {

  // Track the current image
  const [currentImage, setCurrentImage] = useState(0);

  // Automatically change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previousImage) =>
        (previousImage + 1) % carouselImages.length
      );
    }, 3000);

    // Clean up interval
    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />

        <View className="flex-1 bg-black/40  position-relative">

          {/* Your Header */}
          <View className="flex-row items-center justify-center px-6 pt-4">

            <Image
              source={require('../../assets/codaexpress-logo.png')}
              className="w-30 h-30 mr-0"
              resizeMode="contain"
            />

            <Text className="text-white text-4xl font-bold  mt-6">
              Coda
              <Text className="text-brand">Express</Text>
            </Text>

          </View>

          {/* Automatic Image Carousel */}
          <View className="flex-1 items-center justify-center">

            <Image
              key={currentImage}
              source={carouselImages[currentImage]}
              resizeMode="contain"
              className="w-100 h-90 pb-40"
            />
          </View>

          {/* Bottom Text Overlay */}
    {/* Bottom Text Overlay */}
<View className="absolute bottom-0 left-0 right-0 px-6 pt-8 pb-10 bg-black/60 z-10">

  {/* Welcome Heading */}
  <Text className="text-white text-4xl font-bold leading-10">
    Your city.
    {'\n'}Your deliveries.
    {'\n'}On the move.
  </Text>

  {/* Subtitle */}
  <Text className="text-white/80 text-base mt-3">
    Get anything. Anywhere.
    {'\n'}Fast, safe and reliable.
  </Text>

  {/* Get Started Button */}
  <TouchableOpacity
    onPress={onGetStarted}
    className="bg-brand py-4 rounded-xl mt-6 items-center"
  >
    <Text className="text-white font-bold text-lg">
      Get Started
    </Text>
  </TouchableOpacity>

  {/* Terms & Privacy Footer */}
      <View className="flex-row flex-wrap justify-center items-center mt-5">
        <Text className="text-white/60 text-xs">
          By continuing, you agree to our{" "}
        </Text>

        <TouchableOpacity onPress={() => {}}>
          <Text className="text-white text-xs underline">
            Terms of Service
          </Text>
        </TouchableOpacity>

        <Text className="text-white/60 text-xs">{" "}and{" "}</Text>

        <TouchableOpacity onPress={() => {}}>
          <Text className="text-white text-xs underline">
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

</View>
    

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};  