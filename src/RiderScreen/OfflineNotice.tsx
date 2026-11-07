import React, { useState, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Note: In your project, run `npx expo install @react-native-community/netinfo`
// For now, this is structured to accept network state safely.
type Props = {
  isConnected?: boolean;
};

export default function OfflineNotice({ isConnected = true }: Props) {
  if (isConnected) return null;

  return (
    <View className="bg-amber-500/90 py-2 px-4 flex-row items-center justify-center gap-2 z-50">
      <Ionicons name="cloud-offline-outline" size={16} color="#000000" />
      <Text className="text-black text-xs font-black">
        No Internet Connection — Offline Mode Active
      </Text>
    </View>
  );
}