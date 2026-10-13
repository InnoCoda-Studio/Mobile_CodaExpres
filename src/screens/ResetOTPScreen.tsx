import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";

interface ResetOTPScreenProps {
  phoneNumber?: string;
  email?: string;
  onBack: () => void;
  onVerified: (code: string) => void;
}

export default function ResetOTPScreen({
  phoneNumber,
  email,
  onBack,
  onVerified,
}: ResetOTPScreenProps): React.JSX.Element {
  const [otpCode, setOtpCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const targetIdentifier = email || phoneNumber || "";

  const handleVerify = async () => {
    setErrorMessage("");
    const cleanCode = otpCode.trim();

    if (!cleanCode) {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        identifier: targetIdentifier.trim(),
        otp_code: cleanCode,
      };

      const response = await apiClient.post("auth/verify-reset-otp/", payload);

      if (response.status === 200) {
        onVerified(cleanCode); // Step 3: Navigate only after backend returns HTTP 200
      }
    } catch (error: any) {
      const data = error.response?.data;
      const serverError =
        data?.otp_code?.[0] ||
        data?.identifier?.[0] ||
        data?.detail ||
        "Invalid or expired verification code.";

      setErrorMessage(serverError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-5 pt-14 pb-6 justify-between">
          <View>
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#E11D48" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View className="mb-6">
                <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="key-outline" size={28} color="#E11D48" />
                </View>
                <Text className="text-[#001F3F] text-3xl font-black">Enter Reset Code</Text>
                <Text className="text-[#4D78A3] text-base mt-2">
                  We sent a verification code to{" "}
                  <Text className="font-semibold text-[#E11D48]">{targetIdentifier}</Text>.
                </Text>
              </View>

              {errorMessage ? (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex-row items-center">
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text className="text-red-600 text-sm ml-2 flex-1 font-medium">{errorMessage}</Text>
                </View>
              ) : null}

              <View className="border border-[#DCE7F0] rounded-2xl px-4 py-3 mb-6 bg-gray-50/50">
                <Text className="text-[#001F3F] text-xs font-semibold uppercase tracking-wider">
                  Verification Code
                </Text>
                <TextInput
                  value={otpCode}
                  onChangeText={(text) => {
                    setOtpCode(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="Enter code"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  autoFocus
                  maxLength={6}
                  className="text-[#001F3F] text-xl font-bold mt-1 p-0"
                />
              </View>

              <TouchableOpacity
                onPress={handleVerify}
                disabled={isLoading}
                className="bg-[#E11D48] py-4 rounded-xl items-center justify-center active:opacity-90 shadow-sm"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base">Verify Code</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View className="items-center py-2">
            <TouchableOpacity onPress={onBack}>
              <Text className="text-[#0F172A] text-sm">
                Didn't receive code? <Text className="text-[#E11D48] font-bold">Go Back</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}