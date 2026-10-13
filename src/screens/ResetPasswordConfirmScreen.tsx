import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";

interface ResetPasswordConfirmProps {
  identifier: string; // Phone number or email passed from App.tsx
  otpCode: string;    // OTP code passed from App.tsx
  onBack: () => void;
  onSuccess: () => void; // Navigates back to Login screen
}

export default function ResetPasswordConfirmScreen({
  identifier,
  otpCode,
  onBack,
  onSuccess,
}: ResetPasswordConfirmProps): React.JSX.Element {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleResetPassword = async () => {
    setErrorMessage("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-check.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        identifier: (identifier || "").trim(),
        otp_code: (otpCode || "").trim(),
        new_password: newPassword,
      };

      const response = await apiClient.post("auth/reset-password-otp/", payload);

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Password Reset Complete!",
          "Your password has been updated successfully. Please log in with your new password.",
          [
            {
              text: "Log In Now",
              onPress: onSuccess,
            },
          ]
        );
      }
    } catch (error: any) {
      const data = error.response?.data;
      const serverError =
        data?.new_password?.[0] ||
        data?.otp_code?.[0] ||
        data?.identifier?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        data?.error ||
        "Failed to reset password. Please request a new code and try again.";

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
            {/* Header Navigation */}
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#E11D48" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Screen Title */}
              <View className="mb-6">
                <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="lock-closed-outline" size={28} color="#E11D48" />
                </View>
                <Text className="text-[#0F172A] text-3xl font-black">Set New Password</Text>
                <Text className="text-[#4D78A3] text-base mt-2">
                  Create a strong password for your CodaExpress account.
                </Text>
              </View>

              {/* Error Banner */}
              {errorMessage ? (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex-row items-center">
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text className="text-red-600 text-sm ml-2 flex-1 font-medium">{errorMessage}</Text>
                </View>
              ) : null}

              {/* New Password Input */}
              <View className="border border-[#DCE7F0] rounded-2xl px-4 py-3 mb-4 flex-row items-center justify-between bg-gray-50/50">
                <View className="flex-1 mr-2">
                  <Text className="text-[#001F3F] text-xs font-semibold uppercase tracking-wider">
                    New Password
                  </Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    className="text-[#001F3F] text-base mt-1 p-0"
                  />
                </View>
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#4D78A3"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View className="border border-[#DCE7F0] rounded-2xl px-4 py-3 mb-6 flex-row items-center justify-between bg-gray-50/50">
                <View className="flex-1 mr-2">
                  <Text className="text-[#001F3F] text-xs font-semibold uppercase tracking-wider">
                    Confirm Password
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    className="text-[#001F3F] text-base mt-1 p-0"
                  />
                </View>
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#4D78A3"
                  />
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isLoading}
                className="bg-[#E11D48] py-4 rounded-xl items-center justify-center active:opacity-90 shadow-sm mt-2"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base">Update Password</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Footer Back Link */}
          <View className="items-center py-2">
            <TouchableOpacity onPress={onSuccess}>
              <Text className="text-[#0F172A] text-sm">
                Cancel & Return to <Text className="text-[#E11D48] font-bold">Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}