import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface ApplicationSubmittedProps {
  onNext: () => void;
}

export default function ApplicationSubmitted({
  onNext,
}: ApplicationSubmittedProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <View className="flex-1 px-5">

        {/* MAIN CONTENT */}
        <View className="flex-1 items-center justify-center">

          {/* SUCCESS ICON */}
          <View className="w-[52px] h-[52px] rounded-full bg-[#12B978] items-center justify-center mb-7">
            <Ionicons
              name="checkmark"
              size={32}
              color="#FFFFFF"
            />
          </View>

          {/* TITLE */}
          <Text className="text-[#001F3F] text-[20px] font-black text-center">
            Application Submitted!
          </Text>

          {/* THANK YOU */}
          <Text className="text-[#001F3F] text-[17px] font-bold text-center mt-3">
            Thanks, Paul!
          </Text>

          {/* DESCRIPTION */}
          <Text className="text-[#91A9C1] text-[13px] leading-[22px] font-medium text-center mt-3">
            We've received your rider information.{"\n"}
            We'll notify you when your account{"\n"}
            is under review.
          </Text>

          {/* APPLICATION STATUS */}
          <View className="w-full min-h-[59px] rounded-[8px] border border-[#F4E2A3] bg-[#FFFBEA] mt-7 px-4 py-2">

            <Text className="text-[#91A9C1] text-[10px] font-medium">
              Application Status
            </Text>

            <View className="flex-row items-center mt-1">

              {/* YELLOW STATUS ICON */}
              <View className="w-[18px] h-[18px] rounded-full bg-[#FFC400] items-center justify-center mr-2">
                <Ionicons
                  name="time-outline"
                  size={12}
                  color="#FFFFFF"
                />
              </View>

              <Text className="text-[#001F3F] text-[15px] font-bold">
                Under Review
              </Text>

            </View>
          </View>

        </View>

        {/* BACK TO HOME BUTTON */}
        <View className="pb-7">

          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            className="h-[42px] w-full rounded-[7px] border border-[#00C2D1] items-center justify-center"
          >
            <Text className="text-[#00B7C4] text-[12px] font-bold">
              Back to Home
            </Text>
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
}