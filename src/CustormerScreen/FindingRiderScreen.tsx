import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import type {
  CustomerStackParamList,
} from "./Navigation/CustomerTabs";

type Navigation = NativeStackNavigationProp<
  CustomerStackParamList,
  "FindingRider"
>;

type FindingRoute = RouteProp<
  CustomerStackParamList,
  "FindingRider"
>;

export default function FindingRiderScreen() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<Navigation>();
  const route = useRoute<FindingRoute>();

  const { orderId } = route.params;

  const [demoAccepted, setDemoAccepted] = useState(false);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const handleCancel = () => {
    Alert.alert(
      "Cancel order?",
      "This is a demo. No real order will be cancelled.",
      [
        { text: "Keep searching", style: "cancel" },
        {
          text: "Exit demo",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View
      className="flex-1 bg-[#090D16]"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#090D16"
      />

      {/* Header */}
      <View className="flex-row items-center px-5 py-5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-11 h-11 rounded-2xl bg-[#1E293B] items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text className="text-white text-lg font-extrabold ml-4">
          Finding Your Rider
        </Text>
      </View>

      {/* Main content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center justify-center w-64 h-64">

          <Animated.View
            style={{
              transform: [{ scale: pulseScale }],
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.45, 0.1],
              }),
            }}
            className="absolute w-52 h-52 rounded-full bg-[#E11D48]"
          />

          <View className="w-44 h-44 rounded-full border border-[#E11D48]/40 items-center justify-center bg-[#1E293B]">
            <View className="w-28 h-28 rounded-full bg-[#E11D48]/20 items-center justify-center">
              <Ionicons
                name={demoAccepted ? "checkmark-circle" : "bicycle"}
                size={58}
                color={demoAccepted ? "#34D399" : "#E11D48"}
              />
            </View>
          </View>
        </View>

        <Text className="text-white text-2xl font-extrabold text-center mt-6">
          {demoAccepted
            ? "Rider Accepted!"
            : "Searching for nearby riders"}
        </Text>

        <Text className="text-slate-400 text-sm text-center mt-3 leading-6">
          {demoAccepted
            ? "Demo acceptance confirmed. Next, we'll open the live tracking screen."
            : "We're preparing your shopping request for available riders in your area."}
        </Text>

        <View className="bg-[#1E293B] border border-[#334155] rounded-2xl px-5 py-4 mt-8 w-full">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-xs">
              Order reference
            </Text>

            <Text className="text-white font-bold text-sm">
              {orderId}
            </Text>
          </View>

          <View className="h-[1px] bg-[#334155] my-4" />

          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-xs">
              Status
            </Text>

            <Text
              className={`font-bold text-xs ${
                demoAccepted
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {demoAccepted ? "Accepted (Demo)" : "Searching (Demo)"}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom buttons */}
      <View
        className="px-5 pt-4 border-t border-[#334155]"
        style={{
          paddingBottom: Math.max(insets.bottom, 18),
        }}
      >
        <TouchableOpacity
          onPress={() => setDemoAccepted(true)}
          className="bg-[#E11D48] rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-extrabold text-base">
            Simulate Rider Acceptance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCancel}
          className="mt-3 border border-[#475569] rounded-2xl py-4 items-center"
        >
          <Text className="text-slate-300 font-bold">
            Exit Demo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}