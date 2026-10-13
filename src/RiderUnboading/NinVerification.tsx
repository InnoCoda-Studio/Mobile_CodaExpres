import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { verifyNinRealtime } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NinData {
  nin_number: string;
  nin_cardUri: string;
  live_selfieUri: string;
}

interface NinVerificationProps {
  onBack: () => void;
  onNext: (data: NinData) => void;
}

export default function NinVerification({ onBack, onNext }: NinVerificationProps) {
  const [ninNumber, setNinNumber] = useState("");
  const [ninCardUri, setNinCardUri] = useState("");
  const [liveSelfieUri, setLiveSelfieUri] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Load saved drafts silently in the background on mount without blocking UI
  useEffect(() => {
    (async () => {
      try {
        const savedNin = await AsyncStorage.getItem("draft_nin");
        const savedCard = await AsyncStorage.getItem("draft_nin_card");
        const savedSelfie = await AsyncStorage.getItem("draft_selfie");
        
        if (savedNin && !ninNumber) setNinNumber(savedNin);
        if (savedCard && !ninCardUri) setNinCardUri(savedCard);
        if (savedSelfie && !liveSelfieUri) setLiveSelfieUri(savedSelfie);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    })();
  }, []);

  // Instant local state update + background save (prevents typing lag & reloads)
  const handleNinChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setNinNumber(cleaned);
    AsyncStorage.setItem("draft_nin", cleaned).catch(() => {});
  };

  const handleSetCard = async (uri: string) => {
    setNinCardUri(uri);
    await AsyncStorage.setItem("draft_nin_card", uri);
  };

  const handleSetSelfie = async (uri: string) => {
    setLiveSelfieUri(uri);
    await AsyncStorage.setItem("draft_selfie", uri);
  };

  // Helper to pick or snap images with permission recovery
  const pickImage = async (type: "card" | "selfie") => {
    try {
      let { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();

      if (status !== "granted") {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        status = permissionResult.status;
        canAskAgain = permissionResult.canAskAgain;
      }

      if (status !== "granted") {
        if (!canAskAgain) {
          Alert.alert(
            "Camera Permission Required",
            "Camera access is permanently disabled. Please open device settings to enable camera permissions for CodaExpress.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert("Permission Required", "Camera access is required to capture verification documents.");
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // Prevents heavy cropper intent that triggers Android RAM crashes
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (type === "card") {
          await handleSetCard(uri);
        } else {
          await handleSetSelfie(uri);
        }
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Something went wrong while opening the camera.");
    }
  };

  const handleContinue = async () => {
    if (!ninNumber.trim() || ninNumber.length !== 11) {
      setErrorMessage("Please enter a valid 11-digit National Identification Number (NIN).");
      return;
    }

    if (!ninCardUri) {
      setErrorMessage("Please capture or upload your NIN Card / Slip.");
      return;
    }

    if (!liveSelfieUri) {
      setErrorMessage("Please take a live selfie for identity verification.");
      return;
    }

    setErrorMessage("");
    setIsVerifying(true);

    try {
      const result = await verifyNinRealtime(ninNumber.trim());

      if (result.verified) {
        Alert.alert("Identity Verified!", "Your NIN has been verified successfully.", [
          {
            text: "Continue",
            onPress: async () => {
              await AsyncStorage.multiRemove(["draft_nin", "draft_nin_card", "draft_selfie"]);
              
              onNext({
                nin_number: ninNumber.trim(),
                ninCardUri: ninCardUri,
                nin_cardUri: ninCardUri,
                liveSelfieUri: liveSelfieUri,
                live_selfieUri: liveSelfieUri,
              } as any);
            },
          },
        ]);
      } else {
        setErrorMessage(result.message || "NIN verification failed. Please check the number.");
      }
    } catch (error: any) {
      console.error("NIN Verification Error:", error);
      const apiMsg = error.response?.data?.message || error.response?.data?.error;
      setErrorMessage(apiMsg || "Failed to verify NIN in real time. Please check your internet connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <View className="h-[105px] flex-row items-center justify-center relative">
          <TouchableOpacity
            onPress={onBack}
            className="absolute left-5 top-7 w-12 h-12 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={30} color="#001F3F" />
          </TouchableOpacity>

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

        {/* Main Content */}
        <View className="px-7">
          <Text className="text-[28px] leading-[36px] font-black text-[#001F3F]">
            Identity Verification
          </Text>

          <Text className="text-[16px] leading-[23px] font-medium text-[#91A9C1] mt-2">
            Enter your National Identification Number (NIN) and upload required photos.
          </Text>

          {errorMessage ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <Text className="text-red-600 text-sm font-medium">{errorMessage}</Text>
            </View>
          ) : null}

          {/* NIN Number Input */}
          <View className="mt-7">
            <Text className="text-[14px] font-semibold text-[#91A9C1] mb-2">
              11-Digit NIN Number <Text className="text-[#FF4D6D]">*</Text>
            </Text>
            <TextInput
              value={ninNumber}
              onChangeText={handleNinChange}
              maxLength={11}
              keyboardType="number-pad"
              placeholder="Enter your 11-digit NIN"
              placeholderTextColor="#91A9C1"
              className="h-[52px] w-full rounded-[10px] border border-[#DCEAF2] bg-white px-4 text-[16px] text-[#001F3F] tracking-widest font-bold"
            />
          </View>

          {/* NIN Card Upload */}
          <View className="mt-6">
            <Text className="text-[14px] font-semibold text-[#91A9C1] mb-2">
              NIN Slip / Card Photo <Text className="text-[#FF4D6D]">*</Text>
            </Text>

            <TouchableOpacity
              onPress={() => pickImage("card")}
              className="h-[120px] w-full rounded-[12px] border-2 border-dashed border-[#DCEAF2] bg-white items-center justify-center overflow-hidden"
            >
              {ninCardUri ? (
                <Image source={{ uri: ninCardUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center">
                  <Ionicons name="document-text-outline" size={32} color="#2587C8" />
                  <Text className="text-[#001F3F] font-bold text-sm mt-2">Tap to Snap NIN Card</Text>
                  <Text className="text-[#91A9C1] text-xs mt-0.5">Ensure details are clear & readable</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Live Selfie Capture */}
          <View className="mt-6">
            <Text className="text-[14px] font-semibold text-[#91A9C1] mb-2">
              Live Selfie (Your photo) <Text className="text-[#FF4D6D]">*</Text>
            </Text>

            <TouchableOpacity
              onPress={() => pickImage("selfie")}
              className="h-[120px] w-full rounded-[12px] border-2 border-dashed border-[#DCEAF2] bg-white items-center justify-center overflow-hidden"
            >
              {liveSelfieUri ? (
                <Image source={{ uri: liveSelfieUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera-outline" size={32} color="#00C2D1" />
                  <Text className="text-[#001F3F] font-bold text-sm mt-2">Tap to Take Live Selfie</Text>
                  <Text className="text-[#91A9C1] text-xs mt-0.5">Hold phone at eye level</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Verification / Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isVerifying}
            activeOpacity={0.8}
            className="h-[52px] w-full rounded-[10px] bg-[#00C2D1] mt-8 items-center justify-center flex-row"
          >
            {isVerifying ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text className="text-white text-[16px] font-bold ml-2">Verifying NIN...</Text>
              </View>
            ) : (
              <>
                <Text className="text-white text-[16px] font-bold">Verify & Continue</Text>
                <Ionicons name="arrow-forward" size={19} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}