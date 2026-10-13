import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../api/client"; // Your configured Axios instance

interface UnderReviewProps {
  onNext: () => void;
  onBack?: () => void;
  onReupload?: () => void;
}

export default function UnderReview({
  onNext,
  onBack,
  onReupload,
}: UnderReviewProps) {
  const [status, setStatus] = useState<"UNDER_REVIEW" | "APPROVED" | "REJECTED">("UNDER_REVIEW");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    setIsChecking(true);
    try {
      // Calls your Django backend onboarding endpoint
      const res = await axiosInstance.get("/auth/riders/onboarding/");
      const currentStatus = res.data.verification_status || "UNDER_REVIEW";

      setStatus(currentStatus);
      if (res.data.rejection_reason) {
        setRejectionReason(res.data.rejection_reason);
      }

      if (currentStatus === "APPROVED") {
        onNext(); // Transition to Active Order Dashboard
      }
    } catch (error) {
      console.error("Failed to fetch verification status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FCFE" />

      <View className="flex-1 px-5">
        {/* HEADER */}
        <View className="h-[105px] flex-row items-center justify-center relative">
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              className="absolute left-0 top-7 w-12 h-12 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={30} color="#001F3F" />
            </TouchableOpacity>
          )}

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

        {/* MAIN CONTENT */}
        <View className="flex-1 items-center justify-center px-2">
          {status === "REJECTED" ? (
            <>
              {/* REJECTED STATE */}
              <View className="w-[100px] h-[100px] rounded-full bg-[#FFEAEF] items-center justify-center mb-6">
                <MaterialCommunityIcons name="file-cancel-outline" size={60} color="#FF4D6D" />
              </View>

              <Text className="text-[#001F3F] text-[18px] font-extrabold text-center">
                Verification Unsuccessful
              </Text>

              <Text className="text-[#FF4D6D] text-[13px] leading-[20px] text-center mt-3 px-4">
                {rejectionReason || "One or more documents were unclear or invalid. Please re-upload clear photos."}
              </Text>
            </>
          ) : (
            <>
              {/* PENDING / UNDER REVIEW STATE */}
              <View className="w-[105px] h-[105px] rounded-full bg-[#EAF7FF] items-center justify-center mb-5 border-[3px] border-[#D0EDFF]">
                <MaterialCommunityIcons
                  name="clock-time-four-outline"
                  size={58}
                  color="#318BFF"
                />
              </View>

              {/* Status Badge */}
              <View className="bg-[#E6F4FE] px-3 py-1.5 rounded-full mb-4">
                <Text className="text-[#318BFF] text-[11px] font-bold tracking-wide uppercase">
                  Est. Approval: Within 2–4 Hours
                </Text>
              </View>

              <Text className="text-[#001F3F] text-[18px] font-extrabold text-center">
                Documents Submitted
              </Text>

              <Text className="text-[#91A9C1] text-[13px] leading-[20px] text-center mt-2 px-2">
                Our team is currently verifying your identity and vehicle details. We will notify you as soon as your account is activated.
              </Text>

              {/* Visual Progress Steps */}
              <View className="w-full bg-white rounded-2xl p-4 mt-6 border border-[#E8F3FA] shadow-sm">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#00C853" />
                  <Text className="text-[#001F3F] text-[12px] font-semibold ml-2.5">
                    Profile & Documents Uploaded
                  </Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <View className="w-[20px] items-center justify-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-[#318BFF]" />
                  </View>
                  <Text className="text-[#318BFF] text-[12px] font-bold ml-2.5">
                    Admin Verification in Progress
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="ellipse-outline" size={20} color="#D0DCE7" />
                  <Text className="text-[#91A9C1] text-[12px] font-semibold ml-2.5">
                    Account Activation & Wallet Setup
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* BOTTOM BUTTON */}
        <View className="pb-10">
          {status === "REJECTED" ? (
            <TouchableOpacity
              onPress={onReupload}
              activeOpacity={0.8}
              className="h-[46px] w-full rounded-[10px] bg-[#FF4D6D] items-center justify-center"
            >
              <Text className="text-white text-[13px] font-bold">Re-upload Documents</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={fetchVerificationStatus}
              disabled={isChecking}
              activeOpacity={0.8}
              className="h-[46px] w-full rounded-[10px] border-[1.5px] border-[#8DE5F0] bg-white items-center justify-center flex-row"
            >
              {isChecking ? (
                <ActivityIndicator size="small" color="#00B7C4" />
              ) : (
                <Text className="text-[#00B7C4] text-[13px] font-bold">
                  Check Status Again
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}