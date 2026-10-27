
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CustomerStackParamList } from "./Navigation/CustomerTabs";

type OrderType = "delivery" | "shopping";
type OrderStatus = "active" | "completed" | "cancelled";

interface CustomerOrder {
  id: string;
  type: OrderType;
  status: OrderStatus;
  stage: string;
  pickup: string;
  destination: string;
  amount: number | null;
}

const demoOrders: CustomerOrder[] = [
  {
    id: "DEMO-CDX-001",
    type: "delivery",
    status: "active",
    stage: "Rider in transit",
    pickup: "Lekki Phase 1",
    destination: "Victoria Island",
    amount: 2500,
  },
  {
    id: "DEMO-CDX-002",
    type: "shopping",
    status: "active",
    stage: "Shopping in progress",
    pickup: "Mile 12 Market",
    destination: "Ajah",
    amount: null,
  },
  {
    id: "DEMO-CDX-003",
    type: "delivery",
    status: "completed",
    stage: "Delivered",
    pickup: "Chevron",
    destination: "Lekki Phase 1",
    amount: 1800,
  },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  const [filter, setFilter] =
    useState<OrderStatus>("active");

  const filteredOrders = demoOrders.filter(
    (order) => order.status === filter
  );

  const handleTrackOrder = (order: CustomerOrder) => {
    if (order.status !== "active") return;

    // Temporary navigation until tracking screens
    // are registered in CustomerTabs.
    if (order.type === "shopping") {
      navigation.navigate("FindingRider", {
        orderId: order.id,
      });
    } else {
      navigation.navigate("PackageDelivery");
    }
  };

  const handleBookAgain = (order: CustomerOrder) => {
    navigation.navigate(
      order.type === "shopping"
        ? "BuyForMe"
        : "PackageDelivery"
    );
  };

  const renderOrder = (order: CustomerOrder) => {
    const isShopping = order.type === "shopping";

    return (
      <View
        key={order.id}
        className="bg-[#1E293B] rounded-[22px] p-4 mb-4 border border-[#334155]"
      >
        {/* Order header */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center flex-1">
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${
                isShopping
                  ? "bg-[#E11D4820]"
                  : "bg-[#0284C720]"
              }`}
            >
              <Ionicons
                name={isShopping ? "basket" : "cube"}
                size={23}
                color={isShopping ? "#FB7185" : "#38BDF8"}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-white text-[15px] font-extrabold">
                {isShopping
                  ? "Buy For Me"
                  : "Package Delivery"}
              </Text>

              <Text className="text-[#94A3B8] text-xs mt-1">
                {order.id}
              </Text>
            </View>
          </View>

          <View className="bg-[#0F172A] px-3 py-2 rounded-xl">
            <Text
              className={`text-[10px] font-extrabold ${
                order.status === "active"
                  ? "text-[#38BDF8]"
                  : order.status === "completed"
                  ? "text-[#34D399]"
                  : "text-[#FB7185]"
              }`}
            >
              {order.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Pickup / Market */}
        <View className="flex-row items-center">
          <Ionicons
            name="radio-button-on"
            size={18}
            color="#38BDF8"
          />

          <View className="ml-3 flex-1">
            <Text className="text-[#64748B] text-xs">
              {isShopping ? "Market" : "Pickup"}
            </Text>
            <Text className="text-white text-sm font-semibold mt-1">
              {order.pickup}
            </Text>
          </View>
        </View>

        <View className="w-[2px] h-5 bg-[#334155] ml-[8px] my-1" />

        {/* Drop-off */}
        <View className="flex-row items-center mb-5">
          <Ionicons
            name="location"
            size={18}
            color="#E11D48"
          />

          <View className="ml-3 flex-1">
            <Text className="text-[#64748B] text-xs">
              Drop-off
            </Text>
            <Text className="text-white text-sm font-semibold mt-1">
              {order.destination}
            </Text>
          </View>
        </View>

        {/* Order information */}
        <View className="border-t border-[#334155] pt-4 mb-4 flex-row justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-[#94A3B8] text-xs mb-1">
              Order status
            </Text>
            <Text className="text-white text-xs font-semibold">
              {order.stage}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[#94A3B8] text-xs mb-1">
              {isShopping
                ? "Estimated total"
                : "Delivery fee"}
            </Text>
            <Text className="text-white text-base font-extrabold">
              {order.amount === null
                ? "Pending"
                : `₦${order.amount.toLocaleString("en-NG")}`}
            </Text>
          </View>
        </View>

        {/* Order action */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            order.status === "active"
              ? handleTrackOrder(order)
              : handleBookAgain(order)
          }
          className={`py-4 rounded-2xl flex-row items-center justify-center ${
            order.status === "active"
              ? "bg-[#E11D48]"
              : "bg-[#0F172A]"
          }`}
        >
          <Ionicons
            name={
              order.status === "active"
                ? "navigate-outline"
                : "repeat-outline"
            }
            size={19}
            color="#FFFFFF"
          />

          <Text className="text-white font-bold text-sm mx-3">
            {order.status === "active"
              ? isShopping
                ? "View Shopping Order"
                : "View Delivery"
              : "Book Again"}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      className="flex-1 bg-[#090D16]"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 35,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-5 mb-5">
          <View>
            <Text className="text-white text-[28px] font-extrabold">
              My Orders
            </Text>

            <Text className="text-[#94A3B8] text-xs mt-1">
              Manage your deliveries and shopping
            </Text>
          </View>

          <View className="w-12 h-12 rounded-2xl bg-[#1E293B] items-center justify-center">
            <Ionicons
              name="receipt-outline"
              size={24}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Demo information */}
        <View className="flex-row items-center bg-[#0F172A] rounded-xl p-3 mb-5">
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#38BDF8"
          />
          <Text className="text-[#94A3B8] text-xs ml-2 flex-1">
            Demo orders. Real bookings will appear here
            after backend integration.
          </Text>
        </View>

        {/* Filters */}
        <View className="flex-row mb-6">
          {(
            ["active", "completed", "cancelled"] as const
          ).map((item, index) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-xl items-center ${
                index < 2 ? "mr-2" : ""
              } ${
                filter === item
                  ? "bg-[#E11D48]"
                  : "bg-[#1E293B]"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filter === item
                    ? "text-white"
                    : "text-[#94A3B8]"
                }`}
              >
                {item.charAt(0).toUpperCase() +
                  item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-lg font-extrabold">
            {filter.charAt(0).toUpperCase() +
              filter.slice(1)}{" "}
            Orders
          </Text>

          <Text className="text-[#94A3B8] text-xs">
            {filteredOrders.length} orders
          </Text>
        </View>

        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrder)
        ) : (
          <View className="bg-[#1E293B] rounded-2xl items-center py-12 mb-5">
            <Ionicons
              name="file-tray-outline"
              size={45}
              color="#64748B"
            />

            <Text className="text-white font-bold text-base mt-3">
              No {filter} orders
            </Text>

            <Text className="text-[#94A3B8] text-xs mt-2">
              Your orders will appear here.
            </Text>
          </View>
        )}

        {/* New booking */}
        <Text className="text-white text-lg font-extrabold mt-5 mb-4">
          Book Another Service
        </Text>

        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("PackageDelivery")
            }
            className="flex-1 bg-[#1E293B] border border-[#334155] rounded-2xl p-4"
          >
            <Ionicons
              name="cube-outline"
              size={28}
              color="#38BDF8"
            />

            <Text className="text-white font-extrabold text-sm mt-4">
              Package Delivery
            </Text>

            <Text className="text-[#94A3B8] text-xs mt-2">
              Send a package
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("BuyForMe")
            }
            className="flex-1 bg-[#1E293B] border border-[#334155] rounded-2xl p-4"
          >
            <Ionicons
              name="basket-outline"
              size={28}
              color="#FB7185"
            />

            <Text className="text-white font-extrabold text-sm mt-4">
              Buy For Me
            </Text>

            <Text className="text-[#94A3B8] text-xs mt-2">
              Shop at a market
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
