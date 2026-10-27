import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type VehicleType = "Motorbike" | "Bicycle" | "Car";

interface BottomSheetProps {
  bottomOffset?: number;
  maxDrag?: number;
  destination?: string | null;
  onVehicleSelect?: (vehicle: VehicleType) => void;
  onSearchPress?: () => void;
  onLocationPress?: (location: string) => void;
}

const VEHICLES = [
  {
    name: "Motorbike" as VehicleType,
    subtitle: "Fast delivery",
    image: require("../../../assets/bike-man-on-rider.png"),
  },
  {
    name: "Bicycle" as VehicleType,
    subtitle: "Small parcels",
    image: require("../../../assets/bisycle_move.png"),
  },
  {
    name: "Car" as VehicleType,
    subtitle: "Large packages",
    image: require("../../../assets/car.png"),
  },
];

const RECENT_LOCATIONS = [
  { id: "1", name: "Ilaje", address: "Lagos, Nigeria" },
  { id: "2", name: "Lagos", address: "Nigeria" },
];

const SPRING_CONFIG = {
  damping: 25,
  stiffness: 180,
  mass: 0.8,
};

export default function BottomSheet({
  bottomOffset,
  maxDrag = -300,
  destination,
  onVehicleSelect,
  onSearchPress,
  onLocationPress,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleType>("Motorbike");

  const bottomSpace = bottomOffset ?? insets.bottom + 12;

  const COLLAPSED_HEIGHT = 415;
  const MAX_HEIGHT = Math.min(
    screenHeight - insets.top - 20,
    COLLAPSED_HEIGHT + Math.abs(maxDrag)
  );

  const sheetHeight = useSharedValue(COLLAPSED_HEIGHT);
  const startHeight = useSharedValue(COLLAPSED_HEIGHT);

  const gesture = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .failOffsetX([-20, 20])
    .onStart(() => {
      startHeight.value = sheetHeight.value;
    })
    .onUpdate((event) => {
      const nextHeight = startHeight.value - event.translationY;
      sheetHeight.value = Math.max(
        COLLAPSED_HEIGHT,
        Math.min(MAX_HEIGHT, nextHeight)
      );
    })
    .onEnd((event) => {
      const midpoint = (COLLAPSED_HEIGHT + MAX_HEIGHT) / 2;
      const shouldExpand =
        event.velocityY < -350 ||
        (event.velocityY <= 350 && sheetHeight.value > midpoint);

      sheetHeight.value = withSpring(
        shouldExpand ? MAX_HEIGHT : COLLAPSED_HEIGHT,
        SPRING_CONFIG
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const selectVehicle = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    onVehicleSelect?.(vehicle);
  };

  return (
   <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0, 
          // height: sheetHeight,
          backgroundColor: "#090D16",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderTopWidth: 1,
          borderTopColor: "#334155",
          paddingHorizontal: 20,
          paddingTop: 12,
          // 🟢 Add extra bottom padding to push content up while the background covers the bottom edge
          paddingBottom: insets.bottom + 16, 
          overflow: "hidden",
          elevation: 20,
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowRadius: 18,
        },
        animatedStyle,
      ]}
    >
      {/* DRAG HEADER */}
      <GestureDetector gesture={gesture}>
        <View style={{ paddingBottom: 12 }}>
          <View
            style={{
              width: 64,
              height: 5,
              borderRadius: 10,
              backgroundColor: "#475569",
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-2xl font-bold">
                Ready, set, ride.
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                Choose your delivery vehicle
              </Text>
            </View>

            <View className="bg-slate-800 rounded-full px-3 py-2 flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-white text-xs font-semibold">
                Available
              </Text>
            </View>
          </View>
        </View>
      </GestureDetector>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomSpace + 20 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* VEHICLE CARDS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
          style={{ marginBottom: 16 }}
        >
          {VEHICLES.map((vehicle) => {
            const isSelected = selectedVehicle === vehicle.name;

            return (
              <TouchableOpacity
                key={vehicle.name}
                onPress={() => selectVehicle(vehicle.name)}
                activeOpacity={0.85}
                style={{
                  width: 116,
                  minHeight: 132,
                  marginRight: 10,
                  borderRadius: 18,
                  padding: 10,
                  backgroundColor: isSelected ? "#271624" : "#1E293B",
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? "#E11D48" : "#334155",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {isSelected && (
                  <View
                    style={{
                      position: "absolute",
                      top: 7,
                      right: 7,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={17}
                      color="#E11D48"
                    />
                  </View>
                )}

                <Image
                  source={vehicle.image}
                  style={{ width: 70, height: 65 }}
                  resizeMode="contain"
                />

                <Text className="text-white text-sm font-bold">
                  {vehicle.name}
                </Text>

                <Text className="text-slate-400 text-[10px] text-center">
                  {vehicle.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 🟢 HIGH-VISIBILITY DESTINATION SEARCH CTA */}
        <TouchableOpacity
          onPress={onSearchPress}
          activeOpacity={0.9}
          className="flex-row items-center rounded-2xl px-4 py-4 mb-5 shadow-lg"
          style={{
            backgroundColor: "#161D31", // Richer high-contrast surface tint
            borderWidth: 2,
            borderColor: "#FF2D55",     // Vibrant glowing crimson border
            minHeight: 70,
            shadowColor: "#E11D48",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View
            className="items-center justify-center shadow-md"
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: "#E11D48",
            }}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </View>

          <View className="flex-1 ml-3.5">
            <Text
              className="text-white text-lg font-extrabold tracking-wide"
              numberOfLines={1}
            >
              {destination || "Where to?"}
            </Text>
            <Text className="text-rose-300 text-xs font-medium mt-0.5">
              Tap to set destination & route
            </Text>
          </View>

          <View className="w-9 h-9 rounded-full bg-rose-500/20 items-center justify-center mr-1">
            <Ionicons name="arrow-forward" size={20} color="#FF2D55" />
          </View>
        </TouchableOpacity>

        {/* RECENT LOCATIONS */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-bold text-sm">
            Recent locations
          </Text>
          <Ionicons name="time-outline" size={18} color="#94A3B8" />
        </View>

        {RECENT_LOCATIONS.map((location) => (
          <TouchableOpacity
            key={location.id}
            onPress={() => onLocationPress?.(location.name)}
            activeOpacity={0.8}
            className="flex-row items-center py-3 border-b border-slate-800"
          >
            <View className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center">
              <Ionicons name="location-outline" size={20} color="#E11D48" />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-white font-semibold text-sm">
                {location.name}
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                {location.address}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#64748B" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}