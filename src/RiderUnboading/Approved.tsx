import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface ApprovedProps {
  onNext: () => void;
}

export default function Approved({
  onNext,
}: ApprovedProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <View className="flex-1 px-5">

        {/* HEADER */}
        <View className="h-[75px] flex-row items-center justify-center">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/codaexpress-logo.png")}
              className="w-[38px] h-[38px]"
              resizeMode="contain"
            />

            <Text className="text-[#001F3F] text-[19px] font-extrabold ml-1">
              Coda
              <Text className="text-[#FF4D6D]">
                Express
              </Text>
            </Text>
          </View>
        </View>

        {/* MAIN */}
        <View className="flex-1 items-center justify-center">

          {/* SUCCESS CIRCLE */}
          <View className="w-[76px] h-[76px] rounded-full bg-[#E3FFF4] items-center justify-center mb-5">

            <View className="w-[57px] h-[57px] rounded-full bg-[#19C77A] items-center justify-center">
              <Ionicons
                name="checkmark"
                size={34}
                color="#FFFFFF"
              />
            </View>

          </View>

          {/* TITLE */}
          <Text className="text-[#001F3F] text-[19px] font-black text-center">
            Welcome to the Team!
          </Text>

          {/* DESCRIPTION */}
          <Text className="text-[#91A9C1] text-[11px] leading-[18px] text-center mt-3">
            Your rider account has been approved.{"\n"}
            You can now start accepting deliveries{"\n"}
            and earning.
          </Text>

        </View>

        {/* BUTTON */}
        <View className="pb-7">

          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            className="h-[43px] w-full rounded-[7px] bg-[#00C2D1] items-center justify-center flex-row"
          >
            <Text className="text-white text-[12px] font-bold">
              Go to Rider Dashboard
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: 7 }}
            />
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
}