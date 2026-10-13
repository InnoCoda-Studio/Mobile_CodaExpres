import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import apiClient from "../api/client";
import ResetPasswordConfirmScreen from "./ResetPasswordConfirmScreen";

import { Ionicons } from "@expo/vector-icons";
import CountryPicker, {
  type Country,
  type CountryCode,
} from "react-native-country-picker-modal";

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onOtpSent: (phoneNumber: string, email: string) => void;
}

export default function ForgotPasswordScreen({
  onBack,
  onOtpSent,
}: ForgotPasswordScreenProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>("NG");
  const [callingCode, setCallingCode] = useState("234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [useEmail, setUseEmail] = useState(false);
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async () => {
    setErrorMessage("");

    // EMAIL METHOD
    if (useEmail) {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        setErrorMessage("Please enter your email address.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      setIsLoading(true);

      try {
        const response = await apiClient.post(
          "auth/request-password-reset-otp/",
          {
            identifier: cleanEmail,
            method: "email",
            email: cleanEmail,
          }
        );

        console.log("EMAIL RESET RESPONSE:", response.data);

        if (response.status === 200 || response.status === 201) {
          onOtpSent("", cleanEmail);
        }
      } catch (error: any) {
        console.log("EMAIL RESET ERROR:", error.response?.data);

        const serverError =
          error.response?.data?.identifier?.[0] ||
          error.response?.data?.email?.[0] ||
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Unable to send reset code. Please try again.";

        setErrorMessage(serverError);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    // PHONE METHOD
    if (!phoneNumber || phoneNumber.trim().length < 7) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    setIsLoading(true);

    const cleanNumber = phoneNumber.trim().replace(/^0+/, "");
    const fullPhoneNumber = `+${callingCode}${cleanNumber}`;

    try {
      const response = await apiClient.post(
        "auth/request-password-reset-otp/",
        {
          identifier: fullPhoneNumber,
          method: "phone",
          phone_number: fullPhoneNumber,
        }
      );

      console.log("PHONE RESET RESPONSE:", response.data);

      if (response.status === 200 || response.status === 201) {
        onOtpSent(fullPhoneNumber, "");
      }
    } catch (error: any) {
      console.log("PHONE RESET ERROR:", error.response?.data);

      const serverError =
        error.response?.data?.identifier?.[0] ||
        error.response?.data?.phone_number?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Unable to send reset code. Please try again.";

      setErrorMessage(serverError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <TouchableOpacity
        onPress={onBack}
        className="w-12 h-12 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={28} color="#000000" />
      </TouchableOpacity>

      <View className="items-center justify-center">
        <Image source={require("../../assets/codaexpress-logo.png")} />
        <Text className="text-dark text-4xl font-black">
          Coda<Text className="text-brand">Express</Text>
        </Text>
      </View>

      <View className="my-4 justify-center items-center">
        <Text className="text-dark text-3xl font-black mt-4 text-center">
          {useEmail ? "What's your email?" : "What's your phone number?"}
        </Text>

        <Text className="text-gray-500 text-base text-center mt-2">
          We'll send you a verification code to reset your password.
        </Text>
      </View>

      {!useEmail ? (
        <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3">
          <CountryPicker
            countryCode={countryCode}
            withFilter
            withFlag
            withCallingCode
            withCallingCodeButton
            withEmoji
            onSelect={(country: Country) => {
              setCountryCode(country.cca2);
              setCallingCode(country.callingCode[0] ?? "");
            }}
          />

          <View className="h-8 w-px bg-gray-300" />

          <TextInput
            placeholder="801 234 5678"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setErrorMessage("");
            }}
            className="flex-1 py-4 px-3 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      ) : (
        <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-4">
          <Ionicons name="mail-outline" size={22} color="#5B82A5" />

          <TextInput
            placeholder="you@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage("");
            }}
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 py-4 px-3 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      {errorMessage ? (
        <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
      ) : null}

      {/* Switch method */}
      <TouchableOpacity
        onPress={() => {
          setUseEmail(!useEmail);
          setErrorMessage("");
        }}
        className="mt-4 items-center"
      >
        <Text className="text-brand font-semibold text-base">
          {useEmail
            ? "Prefer to use your phone number?"
            : "Prefer to use email instead?"}
        </Text>
      </TouchableOpacity>

      {/* Submit button */}
      <TouchableOpacity
        className="bg-brand py-4 rounded-xl mt-6 items-center"
        onPress={handleSendOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-bold text-lg">Send Reset Code</Text>
        )}
      </TouchableOpacity>

      <Image
        source={require("../../assets/citybg.png")}
        className="top-100 left-0 w-full h-full"
        resizeMode="cover"
      />
    </ScrollView>
  );
}