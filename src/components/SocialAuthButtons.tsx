import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

interface SocialAuthButtonsProps {
  onGooglePress?: () => void;
  onFacebookPress?: () => void;
  dividerText?: string;
}

export default function SocialAuthButtons({
  onGooglePress,
  onFacebookPress,
  dividerText = "Or continue with",
}: SocialAuthButtonsProps) {
  return (
    <View className="w-full">
      {/* Social Divider */}
      <View className="flex-row items-center mx-5 mt-7">
        <View className="flex-1 h-[1px] bg-[#DCE7F0]" />
        <Text className="mx-4 text-[#4D78A3]">{dividerText}</Text>
        <View className="flex-1 h-[1px] bg-[#DCE7F0]" />
      </View>

      {/* Google Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onGooglePress}
        className="mx-5 mt-5 border border-[#DCE7F0] rounded-xl py-4 items-center"
      >
        <View className="flex-row items-center">
          <Image
            className="w-10 h-10 mr-10"
            source={require("../assets/google-logo.jpg")}
          />
          <Text className="text-dark font-medium">Continue with Google</Text>
        </View>
      </TouchableOpacity>

      {/* Facebook Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onFacebookPress}
        className="mx-5 mt-3 border border-[#DCE7F0] rounded-xl py-4 items-center"
      >
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full bg-[#1877F2] items-center justify-center mr-4">
            <Text className="text-white text-2xl font-black">f</Text>
          </View>

          <Text className="text-dark font-medium text-base">
            Continue with Facebook
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}