
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DeliveryStatus =
  | "searching"
  | "assigned"
  | "arriving"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

interface Props {
  status: DeliveryStatus;
}

const steps = [
  { key: "assigned", title: "Rider Assigned" },
  { key: "arriving", title: "Heading to Pickup" },
  { key: "picked_up", title: "Package Collected" },
  { key: "in_transit", title: "Out for Delivery" },
  { key: "delivered", title: "Delivered" },
] as const;

export default function DeliveryProgress({ status }: Props) {
  const currentIndex = steps.findIndex(
    (step) => step.key === status
  );

  return (
    <View className="bg-[#1E293B] rounded-2xl p-5 mb-4">
      <Text className="text-white text-lg font-extrabold mb-5">
        Delivery Progress
      </Text>

      {status === "searching" && (
        <Text className="text-[#94A3B8] mb-4">
          Looking for an available rider...
        </Text>
      )}

      {status === "cancelled" && (
        <Text className="text-[#FB7185] mb-4">
          This delivery has been cancelled.
        </Text>
      )}

      {steps.map((step, index) => {
        const completed =
          status !== "cancelled" && index <= currentIndex;

        const isLast = index === steps.length - 1;

        return (
          <View key={step.key} className="flex-row">
            <View className="items-center mr-4">
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  completed
                    ? "bg-[#E11D48]"
                    : "bg-[#334155]"
                }`}
              >
                <Ionicons
                  name={completed ? "checkmark" : "ellipse-outline"}
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              {!isLast && (
                <View
                  className={`w-[2px] h-9 ${
                    completed && index < currentIndex
                      ? "bg-[#E11D48]"
                      : "bg-[#334155]"
                  }`}
                />
              )}
            </View>

            <View className="flex-1 pt-2">
              <Text
                className={`text-sm font-semibold ${
                  completed
                    ? "text-white"
                    : "text-[#64748B]"
                }`}
              >
                {step.title}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
