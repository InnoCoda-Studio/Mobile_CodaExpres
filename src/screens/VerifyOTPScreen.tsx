import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator 
} from "react-native";
import apiClient from "../api/client";
import axios from "axios";

import { Ionicons } from "@expo/vector-icons";

interface VerifyOTPProps {
  onBack: () => void;
  phoneNumber: string;
  onVerified: () => void;
}

export default function VerifyOTP({
  onBack,
  phoneNumber,
  onVerified,
}: VerifyOTPProps) {

const [otp, setOtp ] = useState(["","","","","",""])
const otpCode = otp.join("")

const inputRefs = useRef<TextInput[]>([]);

const [isLoading, setIsLoading] = useState(false);

// Timer
const [resendTimer, setResendTimer] = useState(45)
useEffect(()=>{
  if (resendTimer === 0){
    return
  }

  const timer = setInterval(()=>{
    setResendTimer((prev) => prev -1 )
  },1000)

  return () => clearInterval(timer)
},[resendTimer])

const handleVerifyOtp = async () => {
  setIsLoading(true);

  try {
    console.log("VERIFY PHONE:", phoneNumber);
    console.log("VERIFY OTP:", otpCode);

    const response = await apiClient.post("/auth/verify-otp/", {
      phone_number: phoneNumber,
      otp_code: otpCode,
    });

    console.log("VERIFY OTP STATUS:", response.status);
    console.log("VERIFY OTP DATA:", response.data);

    if (response.status === 200) {
      onVerified();
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("VERIFY OTP STATUS:", error.response?.status);
      console.log("VERIFY OTP DATA:", error.response?.data);
    } else {
      console.log("VERIFY OTP ERROR:", error);
    }

  } finally {
    setIsLoading(false);
  }
};



const handleResendOtp = async () => {
  try {
    const response = await apiClient.post("/auth/send-otp/", {
      phone_number: phoneNumber,
    });

    console.log("RESEND OTP STATUS:", response.status);
    console.log("RESEND OTP DATA:", response.data);

    // Start the countdown again
    setResendTimer(45);
     

    // Clear the old OTP
    setOtp(["", "", "", "", "", ""]);

    // Put the cursor back in the first box
    inputRefs.current[0]?.focus();

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("RESEND OTP STATUS:", error.response?.status);
      console.log("RESEND OTP DATA:", error.response?.data);
    } else {
      console.log("RESEND OTP ERROR:", error);
    }
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

        {/* Logo  */}
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
            <Text className="font-bold text-3xl my-4">
                Verify your number 
            </Text>

            <Text className="text-xl text-gray-500  ">
                <Text>We sent a code to </Text>

               <TouchableOpacity onPress={onBack}>
                <Text className="text-lg font-bold text-brand mt-2">
                  {phoneNumber}
                </Text>
              </TouchableOpacity>
            </Text>
            
        </View>

     
      {/* Phone Number Input */}
        {/* OTP Input Boxes */}
      <View className="flex-row justify-center gap-3 w-full mt-4">
          {[1,2,3,4,5,6].map((item)=>(
              <TextInput 
               className="
                  w-10 h-12
                  border
                  rounded-lg
                  border-gray-300
                  bg-gray-50
                  text-xl
                  text-gray-900
                  shadow-sm
                  focus:border-rose-600
                  focus:bg-white
                  focus:ring-2
                  focus:ring-rose-600
                "
                  key={item}
                  maxLength={1}
                  keyboardType="number-pad"
                  textAlign="center"

                  ref = {(ref)=>{
                    if(ref){
                      inputRefs.current[item - 1] = ref;
                    }
                  }}

                  value={otp[item - 1]}
                  onChangeText={(text)=>{
                  const newOtp = [...otp];
                  newOtp[item - 1] = text;
                  setOtp(newOtp); 

                  if(text && item < 6){
                    inputRefs.current[item]?.focus();
                  }
                  }}

                  // backword  canselation 
                  onKeyPress={(event) => {
                    if (
                      event.nativeEvent.key === "Backspace" &&
                      !otp[item - 1] &&
                      item > 1
                    ) {
                      inputRefs.current[item - 2]?.focus();
                    }
                  }}
              />
          ))}
        
      </View>

        <View className=" flex-row a items-center justify-center mt-2">
          <Text className="text-gray-500">
            Didn't receive a code?
          </Text>

          {resendTimer > 0 ? (
            <Text className="text-brand font-bold mt-2">
              Resend code in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text className="text-brand font-bold ">
                Resend code
              </Text>
            </TouchableOpacity>
          )}
        </View>

      {/* Verify Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleVerifyOtp}
          disabled={isLoading}
          className="bg-brand py-4 rounded-xl mt-8 items-center justify-center shadow-sm"
        >
  {isLoading ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <Text className="text-white font-bold text-lg">
      Verify
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