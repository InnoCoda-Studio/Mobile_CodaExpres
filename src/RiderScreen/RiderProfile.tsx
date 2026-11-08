import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RiderProfileScreenProps {
  onBack?: () => void;
  onEditVehicle?: () => void;
  onKycDocuments?: () => void;
  onWallet?: () => void;
  onNotifications?: () => void;
  onSwitchToCustomer?: () => void;
  onSupport?: () => void;
  onLogout?: () => void;
  avatarUri?: string;
  fullName?: string;
  phoneNumber?: string;
  vehicleType?: string;
  plateNumber?: string;
  rating?: string;
  totalTrips?: number;
}

export default function RiderProfileScreen({
  onBack,
  onEditVehicle,
  onKycDocuments,
  onWallet,
  onNotifications,
  onSwitchToCustomer,
  onSupport,
  onLogout,
  avatarUri,
  fullName = "Innocent Paul",
  phoneNumber = "+234 813 234 7170",
  vehicleType = "Motorbike (Box Dispatch)",
  plateNumber = "LSD-492-XQ",
  rating = "4.95",
  totalTrips = 142,
}: RiderProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [autoAccept, setAutoAccept] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    Alert.alert("Log Out", "Are you sure you want to log out of your rider account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive" },
    ]);
  };

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

        <Text className="text-white text-base font-black">Rider Profile</Text>

        <TouchableOpacity
          onPress={onNotifications}
          className="w-10 h-10 rounded-2xl bg-[#111B2A] border border-slate-800 items-center justify-center relative"
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E11D48]" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* PROFILE RIDER CARD */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-3xl p-5 mb-5 shadow-2xl">
          <View className="flex-row items-center">
            <View className="relative">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#E11D48] bg-slate-900">
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={40} color="#94A3B8" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-[#111B2A] bg-emerald-500">
                <Ionicons name="checkmark-sharp" size={14} color="#000000" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-white text-lg font-black">{fullName}</Text>
                <View className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <Text className="text-emerald-400 text-[10px] font-extrabold uppercase">Verified</Text>
                </View>
              </View>

              <Text className="text-slate-400 text-xs mb-1.5">{phoneNumber}</Text>

              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text className="text-amber-400 text-xs font-black">{rating}</Text>
                </View>
                <Text className="text-slate-600 text-xs">•</Text>
                <Text className="text-slate-300 text-xs font-bold">{totalTrips} Completed Runs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* VEHICLE & DISPATCH DETAILS */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-3xl p-5 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xs font-black uppercase tracking-wider">Vehicle Setup</Text>
            <TouchableOpacity onPress={onEditVehicle}>
              <Text className="text-[#E11D48] text-xs font-extrabold">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3 bg-[#090D16] border border-slate-800 p-3.5 rounded-2xl mb-3">
            <View className="w-10 h-10 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 items-center justify-center">
              <MaterialCommunityIcons name="motorbike" size={22} color="#E11D48" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Dispatch Type</Text>
              <Text className="text-white text-xs font-extrabold">{vehicleType}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 bg-[#090D16] border border-slate-800 p-3.5 rounded-2xl">
            <View className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center">
              <Ionicons name="card-outline" size={20} color="#38BDF8" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Plate Number</Text>
              <Text className="text-white text-xs font-extrabold tracking-wider">{plateNumber}</Text>
            </View>
          </View>
        </View>

        {/* KYC & VERIFICATION STATUS */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-3xl p-5 mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-xs font-black uppercase tracking-wider">KYC Verification Documents</Text>
            <TouchableOpacity onPress={onKycDocuments}>
              <Text className="text-slate-400 text-xs font-bold">Manage</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-slate-800/80">
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="id-card-outline" size={18} color="#94A3B8" />
              <Text className="text-slate-200 text-xs font-bold">NIN Verification</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="checkmark-circle" size={16} color="#34D399" />
              <Text className="text-emerald-400 text-[11px] font-extrabold">Approved</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-slate-800/80">
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="ribbon-outline" size={18} color="#94A3B8" />
              <Text className="text-slate-200 text-xs font-bold">Rider License</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="checkmark-circle" size={16} color="#34D399" />
              <Text className="text-emerald-400 text-[11px] font-extrabold">Verified</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-2.5">
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="shield-checkmark-outline" size={18} color="#94A3B8" />
              <Text className="text-slate-200 text-xs font-bold">Transit Insurance</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="checkmark-circle" size={16} color="#34D399" />
              <Text className="text-emerald-400 text-[11px] font-extrabold">Active</Text>
            </View>
          </View>
        </View>

        {/* SETTINGS TOGGLE */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-3xl p-5 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 mr-2">
            <View className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center">
              <Ionicons name="flash-outline" size={20} color="#FBBF24" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xs font-extrabold">Auto-Accept Orders</Text>
              <Text className="text-slate-400 text-[10px]">Automatically accept high-priority trips nearby</Text>
            </View>
          </View>
          <Switch
            value={autoAccept}
            onValueChange={setAutoAccept}
            trackColor={{ false: "#1E293B", true: "#E11D48" }}
            thumbColor={autoAccept ? "#FFFFFF" : "#94A3B8"}
          />
        </View>

        {/* SWITCH TO CUSTOMER MODE */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSwitchToCustomer}
          className="bg-[#111B2A] border border-[#E11D48]/40 p-4 rounded-2xl flex-row items-center justify-between mb-4 shadow-xl"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 items-center justify-center">
              <Ionicons name="swap-horizontal" size={20} color="#E11D48" />
            </View>
            <View>
              <Text className="text-white text-xs font-black">Switch to Customer Mode</Text>
              <Text className="text-slate-400 text-[10px]">Book deliveries or send packages</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="h-14 flex-row items-center justify-center rounded-2xl bg-rose-950/40 border border-rose-900/50 mb-5"
        >
          <Ionicons name="log-out-outline" size={20} color="#FB7185" />
          <Text className="ml-2 text-xs font-extrabold text-rose-400">Log Out of Rider Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}