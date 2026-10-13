import React , {useState} from "react";
import { View, TouchableOpacity , 
  Image, Text, TextInput,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator
 } from "react-native";
 import apiClient from "../api/client";

import { Ionicons } from "@expo/vector-icons";

import CountryPicker, {
  type Country,
  type CountryCode,
} from "react-native-country-picker-modal";

interface PhoneNumberInputProps {
  onBack: () => void;
  onOtpSent: (phoneNumber: string) => void;
}

export default function PhoneNumberInput({
  onBack,
  onOtpSent,
}: PhoneNumberInputProps) {

  
const [countryCode, setCountryCode] = useState<CountryCode>("NG");

const [callingCode, setCallingCode] = useState("234");

const [phoneNumber, setPhoneNumber] = useState("");


const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
// Example logic inside your handler:

const handleSendOtp = async () => {
  // 1. Validate phone number
  if (!phoneNumber || phoneNumber.trim().length < 7) {
    setErrorMessage("Please enter a valid phone number.");
    return;
  }

  setErrorMessage("");
  setIsLoading(true);

  // 2. Format phone number
  const cleanNumber = phoneNumber.trim().replace(/^0+/, "");
  const fullPhoneNumber = `+${callingCode}${cleanNumber}`;

  try {
    // 3. Send OTP request to Django
    console.log("Sending OTP to:", fullPhoneNumber);

    const response = await apiClient.post("/auth/send-otp/", {
      phone_number: fullPhoneNumber,
    });

    // 4. Check backend response
    console.log("OTP RESPONSE:", response.status);
    console.log("RESPONSE DATA:", response.data);

    // 5. Navigate to OTP screen
    console.log("Calling onOtpSent...");

    onOtpSent(fullPhoneNumber);

  } catch (error: any) {
    console.log("OTP ERROR:", error.message);
    console.log("STATUS:", error.response?.status);
    console.log("DJANGO ERROR:", error.response?.data);

    const serverError =
      error.response?.data?.phone_number?.[0] ||
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      "Unable to send OTP. Please try again.";

    setErrorMessage(serverError);

  } finally {
    setIsLoading(false);
  }
};

  return (
    <ScrollView className="flex-1 bg-white p-5 ">
      <TouchableOpacity
        onPress={onBack}
        className="w-12 h-12 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={28} color="#000000" />
      </TouchableOpacity>

      <View className=" items-center justify-center ">
          <Image
             source={require('../../assets/codaexpress-logo.png')}
          />
          <Text className="text-dark text-4xl font-black ">
              Coda
              <Text className="text-brand">Express</Text>
          </Text>
      </View> 

      <View className="my-4 justify-center items-center">
        <Text className="font-bold text-3xl mt-4">
          What's your phone number?
        </Text>

        <Text className="text-xl text-gray-500">
          We'll send you a verification code.
        </Text>
      </View>

     
      {/* Phone Number Input */}
      <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3">

        {/* Country Selector */}
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
        {/* Divider */}
         
        <View className="h-8 w-px bg-gray-300" />

            {/* Error Display */}
        
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
      {errorMessage ? (
          <Text className="text-red-500 text-sm mt-2">
            {errorMessage}
          </Text>
        ) : null}
      <TouchableOpacity
          className="bg-brand py-4 rounded-xl mt-6 items-center"
          onPress={handleSendOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Continue
            </Text>
          )}
        </TouchableOpacity>
        
      <Image
        source={require("../../assets/citybg.png")}
        className=" top-100 left-0 w-full h-full"
        resizeMode="cover"
      />
    </ScrollView>
  );
} 