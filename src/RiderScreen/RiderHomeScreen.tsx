import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  walletBalance?: number;
  currencySymbol?: string;
  onTopUp?: () => void;
  onNavigateTab?: (tab: string) => void;
  onSimulateIncomingOrder?: () => void;
};

export default function RiderHomeScreen({
  walletBalance = 15400,
  currencySymbol = "₦",
  onTopUp = () => {},
  onNavigateTab = () => {},
  onSimulateIncomingOrder = () => {},
}: Props) {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-darkBg">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3.5 bg-darkHeader border-b border-darkBorder">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-brand items-center justify-center shadow-rose-glow">
            <Ionicons name="flash" size={18} color="#FFFFFF" />
          </View>
          <Text className="text-white text-lg font-black tracking-tight">
            Coda<Text className="text-brand">Express</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => console.log("Notifications")}
          className="w-11 h-11 rounded-2xl bg-darkCard border border-darkBorder items-center justify-center relative shadow-sm"
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* WALLET BALANCE CARD */}
        <View className="bg-darkCard border border-darkBorder rounded-4xl p-5 shadow-card-dark mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Wallet Balance
            </Text>
            <Text className="text-white text-2xl font-black tracking-tight">
              {currencySymbol}{walletBalance.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onTopUp}
            className="bg-brand px-5 py-3 rounded-2xl flex-row items-center gap-1.5 shadow-rose-glow"
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text className="text-white text-xs font-black">Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* GO ONLINE TOGGLE STATUS CARD */}
        <View className="bg-darkCard border border-darkBorder rounded-4xl p-5 mb-6 shadow-card-dark flex-row items-center justify-between">
          <View className="flex-row items-center gap-3.5">
            <View className={`w-10 h-10 rounded-2xl items-center justify-center border ${
              isOnline ? "bg-status-success/20 border-status-success/40" : "bg-slate-800 border-slate-700"
            }`}>
              <View className={`w-3.5 h-3.5 rounded-full ${isOnline ? "bg-status-success" : "bg-slate-500"}`} />
            </View>
            <View>
              <Text className="text-white text-sm font-extrabold">
                {isOnline ? "Go Online" : "You are Offline"}
              </Text>
              <Text className="text-slate-400 text-xs font-semibold mt-0.5">
                {isOnline ? "Ready to receive orders" : "Toggle on to start earning"}
              </Text>
            </View>
          </View>

          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: "#1E293B", true: "#10B981" }}
            thumbColor={isOnline ? "#FFFFFF" : "#94A3B8"}
          />
        </View>

        {/* WAITING FOR ORDERS RADAR STATE */}
        <View className="items-center justify-center py-10 px-4 bg-darkCard border border-darkBorder rounded-4xl mb-6 shadow-card-dark">
          {isOnline ? (
            <>
              {/* Pulsing visual indicator */}
              <View className="relative items-center justify-center mb-5">
                <View className="w-24 h-24 rounded-full bg-accent-cyan/10 absolute animate-ping" />
                <View className="w-20 h-20 rounded-full bg-accent-cyan/20 items-center justify-center border border-accent-cyan/40 shadow-cyan-glow">
                  <Ionicons name="bicycle" size={32} color="#00E5FF" />
                </View>
              </View>

              <Text className="text-white text-base font-black mb-1">
                Waiting for Orders...
              </Text>
              <Text className="text-slate-400 text-xs font-semibold text-center mb-6">
                Stay online to get nearby grocery & dispatch requests
              </Text>

              {/* TEST TRIGGER BUTTON FOR DEVELOPMENT */}
              <TouchableOpacity
                onPress={onSimulateIncomingOrder}
                className="bg-darkHeader border border-accent-cyan/30 px-4 py-2.5 rounded-2xl"
                activeOpacity={0.8}
              >
                <Text className="text-accent-cyan text-xs font-extrabold">
                  ⚡ Simulate Incoming Order
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="items-center py-4">
              <View className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center mb-3">
                <Ionicons name="moon-outline" size={28} color="#64748B" />
              </View>
              <Text className="text-white text-base font-bold mb-1">You are currently offline</Text>
              <Text className="text-slate-400 text-xs text-center">Switch on "Go Online" above to start receiving dispatch tasks.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="flex-row items-center justify-around px-2 pt-3 bg-darkHeader border-t border-darkBorder"
      >
        <TouchableOpacity
          onPress={() => onNavigateTab("home")}
          className="items-center py-1 px-4"
        >
          <Ionicons name="home" size={20} color="#E11D48" />
          <Text className="text-brand text-[10px] font-black mt-1">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigateTab("wallet")}
          className="items-center py-1 px-4 opacity-60"
        >
          <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
          <Text className="text-slate-400 text-[10px] font-bold mt-1">Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigateTab("history")}
          className="items-center py-1 px-4 opacity-60"
        >
          <Ionicons name="time-outline" size={20} color="#FFFFFF" />
          <Text className="text-slate-400 text-[10px] font-bold mt-1">History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigateTab("profile")}
          className="items-center py-1 px-4 opacity-60"
        >
          <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          <Text className="text-slate-400 text-[10px] font-bold mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}