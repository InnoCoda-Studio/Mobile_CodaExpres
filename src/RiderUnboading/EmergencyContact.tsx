import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/client"; // Adjust path to your axios client instance
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmergencyContactData {
  emergency_full_name: string;
  emergency_phone_number: string;
  emergency_relationship: string;
}

interface EmergencyContactProps {
  onBack: () => void;
  onNext: (data: EmergencyContactData) => void;
}

const RELATIONSHIPS = [
  "Sister",
  "Brother",
  "Father",
  "Mother",
  "Spouse",
  "Friend",
  "Relative",
];

export default function EmergencyContact({
  onBack,
  onNext,
}: EmergencyContactProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState("Select relationship");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved draft on mount
  useEffect(() => {
    (async () => {
      try {
        const savedName = await AsyncStorage.getItem("draft_emergency_name");
        const savedPhone = await AsyncStorage.getItem("draft_emergency_phone");
        const savedRel = await AsyncStorage.getItem("draft_emergency_rel");

        if (savedName) setFullName(savedName);
        if (savedPhone) setPhoneNumber(savedPhone);
        if (savedRel) setRelationship(savedRel);
      } catch (e) {
        console.error("Failed to load emergency contact draft", e);
      }
    })();
  }, []);

  // Save drafts instantly
  const handleNameChange = (text: string) => {
    setFullName(text);
    AsyncStorage.setItem("draft_emergency_name", text).catch(() => {});
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+\s]/g, "");
    setPhoneNumber(cleaned);
    AsyncStorage.setItem("draft_emergency_phone", cleaned).catch(() => {});
  };

  const handleSelectRelationship = (rel: string) => {
    setRelationship(rel);
    setIsDropdownOpen(false);
    AsyncStorage.setItem("draft_emergency_rel", rel).catch(() => {});
  };

  const handleContinue = async () => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your emergency contact's full name.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }
    if (relationship === "Select relationship") {
      setErrorMessage("Please select your relationship with this contact.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const payload = {
      emergency_full_name: fullName.trim(),
      emergency_phone_number: phoneNumber.trim(),
      emergency_relationship: relationship.trim(),
    };

    try {
      // Sync directly with Django onboarding endpoint
      await axiosInstance.patch("/auth/riders/onboarding/", payload);

      // Clear local drafts on success
      await AsyncStorage.multiRemove([
        "draft_emergency_name",
        "draft_emergency_phone",
        "draft_emergency_rel",
      ]);

      onNext(payload);
    } catch (error: any) {
      console.error("Emergency Contact Error:", error);
      const apiMsg = error.response?.data?.error || error.response?.data?.detail;
      setErrorMessage(apiMsg || "Failed to save emergency contact. Please check your connection.");
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
          <View className="h-[85px] flex-row items-center justify-center relative">
            <TouchableOpacity
              onPress={onBack}
              className="absolute left-[-8px] top-5 w-12 h-12 items-center justify-center"
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

          {/* CONTENT */}
          <View className="pt-5">
            <Text className="text-[#001F3F] text-[21px] font-black">
              Emergency Contact
            </Text>

            <Text className="text-[#91A9C1] text-[13px] leading-[22px] font-medium mt-2 mb-6">
              In case of an emergency, we'll contact{"\n"}this person.
            </Text>

            {errorMessage ? (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-xs font-medium">{errorMessage}</Text>
              </View>
            ) : null}

            {/* FULL NAME */}
            <Text className="text-[#66829B] text-[13px] font-medium mb-1">
              Full Name <Text className="text-[#FF4D6D]">*</Text>
            </Text>
            <View className="h-[47px] w-full bg-white border border-[#DCEAF2] rounded-[8px] justify-center px-3 mb-4">
              <TextInput
                value={fullName}
                onChangeText={handleNameChange}
                placeholder="Enter full name"
                placeholderTextColor="#91A9C1"
                className="text-[14px] text-[#001F3F]"
              />
            </View>

            {/* PHONE NUMBER */}
            <Text className="text-[#66829B] text-[13px] font-medium mb-1">
              Phone Number <Text className="text-[#FF4D6D]">*</Text>
            </Text>
            <View className="h-[47px] w-full bg-white border border-[#DCEAF2] rounded-[8px] justify-center px-3 mb-4">
              <TextInput
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder="+234 800 000 0000"
                placeholderTextColor="#91A9C1"
                keyboardType="phone-pad"
                className="text-[14px] text-[#001F3F]"
              />
            </View>

            {/* RELATIONSHIP DROPDOWN */}
            <Text className="text-[#66829B] text-[13px] font-medium mb-1">
              Relationship <Text className="text-[#FF4D6D]">*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-[47px] w-full bg-white border border-[#DCEAF2] rounded-[8px] flex-row items-center justify-between px-3"
            >
              <Text className={`text-[14px] ${relationship === "Select relationship" ? "text-[#91A9C1]" : "text-[#001F3F] font-semibold"}`}>
                {relationship}
              </Text>
              <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#4F7188" />
            </TouchableOpacity>

            {/* INLINE DROPDOWN OPTIONS */}
            {isDropdownOpen && (
              <View className="w-full bg-white border border-[#DCEAF2] rounded-[8px] mt-1 overflow-hidden shadow-sm">
                {RELATIONSHIPS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectRelationship(item)}
                    className="py-3 px-3 border-b border-[#F0F5F8]"
                  >
                    <Text className="text-[14px] text-[#001F3F] font-medium">{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* CONTINUE BUTTON */}
          <View className="flex-1 justify-end pb-7 pt-8">
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isSubmitting}
              activeOpacity={0.8}
              className="h-[52px] w-full rounded-[9px] bg-[#00C2D1] items-center justify-center flex-row"
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-white text-[15px] font-bold ml-2">Saving...</Text>
                </View>
              ) : (
                <>
                  <Text className="text-white text-[15px] font-bold">Continue</Text>
                  <Ionicons name="arrow-forward" size={19} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}