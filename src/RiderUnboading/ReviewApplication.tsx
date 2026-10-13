import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/client"; // Adjust path to your axios instance

interface ReviewApplicationProps {
  onBack: () => void;

  // Navigation handlers to step back and edit sections
  onEditPersonal: () => void;
  onEditIdentity: () => void;
  onEditVehicle: () => void;
  onEditDocuments: () => void;
  onEditEmergency: () => void;
  onEditPayout: () => void;

  // Triggers transition to the "Under Review" screen
  onSubmitSuccess: () => void;
}

type ReviewItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  isComplete: boolean;
  onEdit: () => void;
};

function ReviewItem({
  icon,
  title,
  isComplete,
  onEdit,
}: ReviewItemProps) {
  return (
    <View className="h-[64px] border-b border-[#E4EFF4] flex-row items-center">
      {/* ICON */}
      <View
        className={`w-[32px] h-[32px] rounded-[8px] items-center justify-center mr-3 ${
          isComplete ? "bg-[#0BC0CC]" : "bg-[#FF9F43]"
        }`}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#FFFFFF" />
      </View>

      {/* TITLE + STATUS */}
      <View className="flex-1">
        <Text className="text-[#001F3F] text-[13px] font-semibold">
          {title}
        </Text>

        <Text
          className={`text-[12px] font-medium mt-0.5 ${
            isComplete ? "text-[#20A86B]" : "text-[#FF9F43]"
          }`}
        >
          {isComplete ? "Completed" : "Incomplete"}
        </Text>
      </View>

      {/* EDIT BUTTON */}
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.7}
        className="px-2 py-2"
      >
        <Text className="text-[#00B8C5] text-[12px] font-bold">Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ReviewApplication({
  onBack,
  onEditPersonal,
  onEditIdentity,
  onEditVehicle,
  onEditDocuments,
  onEditEmergency,
  onEditPayout,
  onSubmitSuccess,
}: ReviewApplicationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Section completion states
  const [isPersonalDone, setIsPersonalDone] = useState(true);
  const [isIdentityDone, setIsIdentityDone] = useState(false);
  const [isVehicleDone, setIsVehicleDone] = useState(false);
  const [isEmergencyDone, setIsEmergencyDone] = useState(false);
  const [isPayoutDone, setIsPayoutDone] = useState(false);

  // Check section completeness on screen focus/mount
  useEffect(() => {
    (async () => {
      try {
        const nin = await AsyncStorage.getItem("draft_nin");
        const vehiclePhoto = await AsyncStorage.getItem("draft_car_photo");
        const emergencyPhone = await AsyncStorage.getItem("draft_emergency_phone");
        const bankName = await AsyncStorage.getItem("draft_bank_name");
        const accountName = await AsyncStorage.getItem("draft_account_name");

        if (nin) setIsIdentityDone(true);
        if (vehiclePhoto) setIsVehicleDone(true);
        if (emergencyPhone) setIsEmergencyDone(true);
        if (bankName || accountName) setIsPayoutDone(true);
      } catch (e) {
        console.error("Error checking section completion:", e);
      }
    })();
  }, []);

  const handleSubmitApplication = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // 1. Submit final onboarding flag to DRF backend
      await axiosInstance.patch("/auth/riders/onboarding/", {
        verification_status: "UNDER_REVIEW",
        is_onboarding_completed: true,
      });

      // 2. Clear local draft storage on successful submission
      await AsyncStorage.multiRemove([
        "draft_nin",
        "draft_car_plate",
        "draft_car_make",
        "draft_car_model",
        "draft_car_photo",
        "draft_car_license",
        "draft_emergency_phone",
        "draft_bank_name",
        "draft_account_number",
        "draft_account_name",
      ]);

      // 3. Transition to the Under Review screen
      onSubmitSuccess();
    } catch (error: any) {
      console.error("Submission error:", error);
      const apiMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to submit application. Please check your connection.";
      setErrorMessage(apiMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-5">
          {/* HEADER */}
          <View className="h-[80px] flex-row items-center justify-center relative">
            <TouchableOpacity
              onPress={onBack}
              className="absolute left-[-8px] top-4 w-12 h-12 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={28} color="#001F3F" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <Image
                source={require("../../assets/codaexpress-logo.png")}
                className="w-[38px] h-[38px]"
                resizeMode="contain"
              />
              <Text className="text-[#001F3F] text-[19px] font-extrabold ml-1">
                Coda<Text className="text-[#FF4D6D]">Express</Text>
              </Text>
            </View>
          </View>

          {/* MAIN CONTENT */}
          <View className="pt-3">
            <Text className="text-[#001F3F] text-[20px] font-black">
              Review Your Application
            </Text>

            <Text className="text-[#91A9C1] text-[13px] leading-[20px] mt-1 mb-4">
              Please review your information before submitting.
            </Text>

            {errorMessage ? (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-xs font-medium">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* REVIEW ITEMS */}
            <ReviewItem
              icon="account-outline"
              title="Personal Information"
              isComplete={isPersonalDone}
              onEdit={onEditPersonal}
            />

            <ReviewItem
              icon="shield-account-outline"
              title="Identity Verification"
              isComplete={isIdentityDone}
              onEdit={onEditIdentity}
            />

            <ReviewItem
              icon="motorbike"
              title="Vehicle Information"
              isComplete={isVehicleDone}
              onEdit={onEditVehicle}
            />

            <ReviewItem
              icon="file-document-outline"
              title="Documents"
              isComplete={isVehicleDone}
              onEdit={onEditDocuments}
            />

            <ReviewItem
              icon="account-heart-outline"
              title="Emergency Contact"
              isComplete={isEmergencyDone}
              onEdit={onEditEmergency}
            />

            <ReviewItem
              icon="wallet-outline"
              title="Payout Information"
              isComplete={isPayoutDone}
              onEdit={onEditPayout}
            />
          </View>

          {/* SUBMIT BUTTON */}
          <View className="flex-1 justify-end pb-7 pt-8">
            <TouchableOpacity
              onPress={handleSubmitApplication}
              disabled={isSubmitting}
              activeOpacity={0.85}
              className="h-[52px] w-full rounded-[8px] bg-[#F50746] flex-row items-center justify-center"
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-white text-[14px] font-bold ml-2">
                    Submitting Application...
                  </Text>
                </View>
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                  <Text className="text-white text-[14px] font-bold ml-2">
                    Submit Application
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}