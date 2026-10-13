import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateRiderProfile } from "../api/client"; // Handles PATCH /auth/riders/onboarding/

export type VehicleType = "bicycle" | "motorcycle" | "car";

interface RiderInfoProp {
  onBack: () => void;
  onNext: (vehicle: VehicleType) => void;
}

export default function RiderInfo_2({ onBack, onNext }: RiderInfoProp) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const vehicles = [
    {
      id: "bicycle" as VehicleType,
      name: "Bicycle",
      description: "Lower earning, more freedom",
      icon: "bicycle",
      color: "#00C2D1",
    },
    {
      id: "motorcycle" as VehicleType,
      name: "Motorcycle",
      description: "Faster and more flexible",
      icon: "motorbike",
      color: "#F51F45",
    },
    {
      id: "car" as VehicleType,
      name: "Car",
      description: "Higher earning, more space",
      icon: "car",
      color: "#001F3F",
    },
  ];

  const handleContinue = async () => {
    if (!selectedVehicle) {
      setErrorMessage("Please select a vehicle type to proceed.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Send vehicle choice to Django API
      await updateRiderProfile({ vehicle_type: selectedVehicle });
      
      // Proceed to next onboarding screen
      onNext(selectedVehicle);
    } catch (error: any) {
      console.error("Error saving vehicle selection:", error);
      const apiMsg = error.response?.data?.message || error.response?.data?.error;
      setErrorMessage(apiMsg || "Failed to update vehicle selection. Please check your network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* HEADER */}
        <View className="h-[105px] flex-row items-center justify-center relative">
          {/* Back Button */}
          <TouchableOpacity
            onPress={onBack}
            className="absolute left-5 top-7 w-12 h-12 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={30} color="#001F3F" />
          </TouchableOpacity>

          {/* Logo */}
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/codaexpress-logo.png")}
              className="w-[42px] h-[42px]"
              resizeMode="contain"
            />
            <Text className="text-[#001F3F] text-[22px] font-extrabold ml-1">
              Coda<Text className="text-[#FF4D6D]">Express</Text>
            </Text>
          </View>
        </View>

        {/* MAIN CONTENT */}
        <View className="px-7">
          {/* TITLE */}
          <Text className="text-[26px] leading-[34px] font-black text-[#001F3F]">
            What vehicle will you use{"\n"}for delivery?
          </Text>

          {/* DESCRIPTION */}
          <Text className="text-[15px] leading-[22px] font-medium text-[#91A9C1] mt-3">
            Select the type of vehicle you'll be using.
          </Text>
          <Text className="text-[15px] leading-[22px] font-medium text-[#91A9C1]">
            You can only choose one.
          </Text>

          {/* ERROR ALERT */}
          {errorMessage ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <Text className="text-red-600 text-sm font-medium">{errorMessage}</Text>
            </View>
          ) : null}

          {/* VEHICLES LIST */}
          <View className="mt-6">
            {vehicles.map((vehicle) => {
              const isSelected = selectedVehicle === vehicle.id;

              return (
                <TouchableOpacity
                  key={vehicle.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedVehicle(vehicle.id);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className={`h-[96px] w-full rounded-[10px] mb-4 bg-white flex-row items-center px-5 ${
                    isSelected
                      ? "border-2 border-[#00C2D1]"
                      : "border border-[#DCEAF2]"
                  }`}
                >
                  {/* VEHICLE ICON */}
                  <View className="w-[62px] items-center justify-center">
                    <MaterialCommunityIcons
                      name={vehicle.icon as any}
                      size={47}
                      color={vehicle.color}
                    />
                  </View>

                  {/* TEXT */}
                  <View className="ml-5 flex-1">
                    <Text className="text-[16px] font-bold text-[#001F3F]">
                      {vehicle.name}
                    </Text>

                    <Text className="text-[13px] font-medium text-[#91A9C1] mt-1">
                      {vehicle.description}
                    </Text>
                  </View>

                  {/* SELECTED INDICATOR */}
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-[#00C2D1] items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CONTINUE BUTTON */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedVehicle || isSubmitting}
            activeOpacity={0.8}
            className={`h-[52px] w-full rounded-[10px] mt-10 items-center justify-center flex-row ${
              selectedVehicle && !isSubmitting ? "bg-[#00C2D1]" : "bg-[#A8DDE2]"
            }`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text className="text-white text-[16px] font-bold ml-2">Saving...</Text>
              </View>
            ) : (
              <>
                <Text className="text-white text-[16px] font-bold">Continue</Text>
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color="#FFFFFF"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}