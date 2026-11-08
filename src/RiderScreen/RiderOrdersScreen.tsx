import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onBack?: () => void;
  onSelectOrder?: (order: any) => void;
};

interface OrderItem {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  earnings: string;
  packageType: string;
  status: "completed" | "cancelled";
  date: string;
  time: string;
}

const mockOrders: OrderItem[] = [
  {
    id: "CDX-94821",
    pickup: "Bola Matanmi St, Lekki Phase 1",
    dropoff: "Royal Garden Estate, Ajah",
    distance: "4.2 km",
    earnings: "₦2,600",
    packageType: "Documents & Laptop Box",
    status: "completed",
    date: "Today",
    time: "11:15 AM",
  },
  {
    id: "CDX-94102",
    pickup: "Admiralty Way, Lekki Phase 1",
    dropoff: "VGC Gate 3, Lekki-Epe Expressway",
    distance: "6.8 km",
    earnings: "₦3,800",
    packageType: "E-Commerce Gadget",
    status: "completed",
    date: "Today",
    time: "9:30 AM",
  },
  {
    id: "CDX-93884",
    pickup: "Freedom Way, Lekki",
    dropoff: "Ikota Shopping Complex",
    distance: "3.5 km",
    earnings: "₦2,100",
    packageType: "Clothing / Fashion Bag",
    status: "completed",
    date: "Yesterday",
    time: "4:15 PM",
  },
  {
    id: "CDX-93210",
    pickup: "Marwa Bus Stop, Lekki",
    dropoff: "Agungi, Lekki",
    distance: "2.1 km",
    earnings: "₦1,500",
    packageType: "Food Tray",
    status: "cancelled",
    date: "Yesterday",
    time: "1:20 PM",
  },
];

export default function RiderOrdersScreen({
  onBack = () => {},
  onSelectOrder = () => {},
}: Props) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.dropoff.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCompletedEarnings = mockOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parseInt(o.earnings.replace(/[^\d]/g, ""), 10), 0);

  return (
    <View className="flex-1 bg-[#06090F]" style={{ paddingTop: insets.top }}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-[#090D16] border-b border-slate-800">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-2xl bg-[#111B2A] border border-slate-800 items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-black">My Delivery Runs</Text>

        <View className="w-10 h-10 rounded-2xl bg-[#E11D48]/10 border border-[#E11D48]/30 items-center justify-center">
          <Ionicons name="receipt-outline" size={20} color="#E11D48" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* SUMMARY CARD */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-3xl p-5 mb-5 shadow-2xl">
          <Text className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">
            Total Earnings (Completed Runs)
          </Text>
          <Text className="text-emerald-400 text-3xl font-black mb-4">
            ₦{totalCompletedEarnings.toLocaleString()}
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-[#090D16] border border-slate-800 p-3.5 rounded-2xl">
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Completed</Text>
              <Text className="text-white text-base font-black mt-0.5">
                {mockOrders.filter((o) => o.status === "completed").length} Runs
              </Text>
            </View>

            <View className="flex-1 bg-[#090D16] border border-slate-800 p-3.5 rounded-2xl">
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Cancelled</Text>
              <Text className="text-rose-400 text-base font-black mt-0.5">
                {mockOrders.filter((o) => o.status === "cancelled").length} Runs
              </Text>
            </View>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-2xl px-4 py-3 mb-4 flex-row items-center gap-3">
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by Order ID or location..."
            placeholderTextColor="#64748B"
            className="flex-1 text-white text-xs font-bold"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTER TABS */}
        <View className="flex-row gap-2 mb-4">
          {(["all", "completed", "cancelled"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${
                filter === tab
                  ? "bg-[#E11D48]/20 border-[#E11D48]"
                  : "bg-[#111B2A] border-slate-800"
              }`}
            >
              <Text
                className={`text-xs font-bold capitalize ${
                  filter === tab ? "text-[#E11D48]" : "text-slate-400"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ORDER LIST */}
        {filteredOrders.length === 0 ? (
          <View className="py-16 items-center">
            <Ionicons name="receipt-outline" size={48} color="#334155" />
            <Text className="text-slate-400 text-sm font-bold mt-3">No delivery runs found</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.8}
              onPress={() => onSelectOrder(order)}
              className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-white text-xs font-black">#{order.id}</Text>
                  <Text className="text-slate-500 text-xs">•</Text>
                  <Text className="text-slate-400 text-xs">{order.date}, {order.time}</Text>
                </View>

                <View
                  className={`px-2.5 py-1 rounded-full border ${
                    order.status === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-rose-500/10 border-rose-500/30"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black uppercase ${
                      order.status === "completed" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <Text className="text-white text-xs font-bold mb-3">{order.packageType}</Text>

              <View className="bg-[#090D16] border border-slate-800/80 rounded-xl p-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5" />
                  <Text className="text-slate-300 text-[11px] flex-1" numberOfLines={1}>
                    {order.pickup}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="w-2.5 h-2.5 rounded-full bg-[#E11D48] mr-2.5" />
                  <Text className="text-slate-300 text-[11px] flex-1" numberOfLines={1}>
                    {order.dropoff}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-slate-400 text-xs">{order.distance} distance</Text>
                <Text className="text-emerald-400 text-base font-black">{order.earnings}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}