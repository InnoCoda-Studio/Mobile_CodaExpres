import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileScreenProps {
  onBack?: () => void;
  onEditProfile?: () => void;
  onAddresses?: () => void;
  onPaymentMethods?: () => void;
  onCurrency?: () => void;
  onNotifications?: () => void;
  onPrivacy?: () => void;
  onSwitchToRider?: () => void;
  onSupport?: () => void;
  onAbout?: () => void;
  onLogout?: () => void;
  avatarUri?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
}

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  iconColor?: string;
}

function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
  iconColor = "#E11D48",
}: SettingRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="min-h-[76px] flex-row items-center rounded-2xl border border-slate-800 bg-[#111B2A] px-4 py-3"
    >
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-[15px] font-bold text-white">
          {title}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-400">
          {subtitle}
        </Text>
      </View>

      {trailing || (
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({
  onBack,
  onEditProfile,
  onAddresses,
  onPaymentMethods,
  onCurrency,
  onNotifications,
  onPrivacy,
  onSwitchToRider,
  onSupport,
  onAbout,
  onLogout,
  avatarUri,
  fullName = "Daniel K.",
  phoneNumber = "+234 813 647 1776",
  email = "daniel@example.com",
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive" },
    ]);
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#06090F"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 20,
        }}
      >
        {/* Header */}
        <View className="border-b border-slate-800 bg-[#090D16] px-5 pb-4">
          <View
            className="flex-row items-center justify-between"
            style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
          >
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center rounded-full bg-slate-900 border border-slate-800"
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/codaexpress-logo.png")}
                resizeMode="contain"
                className="mr-2 h-8 w-8"
              />
              <Text className="text-lg font-black tracking-tight text-white">
                Coda<Text className="text-[#E11D48]">Express</Text>
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className="relative h-11 w-11 items-center justify-center rounded-full bg-slate-900 border border-slate-800"
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#FFFFFF"
              />
              <View className="absolute right-2 top-2 h-4 w-4 items-center justify-center rounded-full bg-[#E11D48]">
                <Text className="text-[10px] font-bold text-white">3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 pt-5">
          {/* Page title */}
          <View className="mb-5">
            <Text className="text-2xl font-black text-white">
              Settings
            </Text>
            <Text className="mt-1 text-xs text-slate-400">
              Manage your delivery profile and preferences
            </Text>
          </View>

          {/* Profile card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onEditProfile}
            className="mb-5 flex-row items-center rounded-2xl border border-slate-800 bg-[#111B2A] p-4 shadow-xl"
          >
            <View className="relative">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#E11D48] bg-slate-900">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={40}
                    color="#94A3B8"
                  />
                )}
              </View>

              <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-[#111B2A] bg-[#E11D48]">
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <View className="mb-1.5 flex-row flex-wrap items-center">
                <Text className="mr-2 text-base font-black text-white">
                  {fullName}
                </Text>

                <View className="flex-row items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color="#34D399"
                  />
                  <Text className="ml-1 text-[10px] font-bold text-emerald-400">
                    Verified
                  </Text>
                </View>
              </View>

              <View className="mb-1 flex-row items-center">
                <Ionicons name="call-outline" size={14} color="#94A3B8" />
                <Text className="ml-2 text-xs text-slate-300">
                  {phoneNumber}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={14} color="#94A3B8" />
                <Text
                  numberOfLines={1}
                  className="ml-2 flex-1 text-xs text-slate-400"
                >
                  {email}
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Account settings */}
          <View className="mb-5">
            <SettingRow
              icon="location-outline"
              title="Saved Addresses"
              subtitle="Manage pickup and drop-off locations"
              onPress={onAddresses}
            />

            <View className="h-2" />

            <SettingRow
              icon="card-outline"
              title="Payment Methods"
              subtitle="Cards & dispatch payment settings"
              onPress={onPaymentMethods}
              trailing={
                <View className="flex-row items-center">
                  <View className="mr-2 rounded-md bg-slate-900 border border-slate-800 px-2 py-1">
                    <Text className="text-[10px] font-extrabold tracking-widest text-slate-300">
                      CARD
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              }
            />

            <View className="h-2" />

            <SettingRow
              icon="cash-outline"
              title="Currency & Location"
              subtitle="NGN ₦ • Lagos, Nigeria"
              onPress={onCurrency}
              trailing={
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base">🇳🇬</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#64748B"
                  />
                </View>
              }
            />
          </View>

          {/* Appearance */}
          <View className="mb-5 min-h-[76px] flex-row items-center rounded-2xl border border-slate-800 bg-[#111B2A] px-4 py-3">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
              <Ionicons name="sunny-outline" size={24} color="#FBBF24" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-[15px] font-bold text-white">
                Appearance
              </Text>
              <Text className="mt-0.5 text-xs text-slate-400">
                Choose your app theme
              </Text>
            </View>

            <View className="flex-row rounded-full border border-slate-800 bg-slate-900 p-1">
              <TouchableOpacity
                onPress={() => setTheme("dark")}
                className={`rounded-full px-3 py-1.5 ${
                  theme === "dark" ? "bg-[#E11D48]" : ""
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    theme === "dark" ? "text-white" : "text-slate-400"
                  }`}
                >
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTheme("light")}
                className={`rounded-full px-3 py-1.5 ${
                  theme === "light" ? "bg-[#E11D48]" : ""
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    theme === "light" ? "text-white" : "text-slate-400"
                  }`}
                >
                  Light
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences */}
          <View className="mb-5">
            <SettingRow
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage tracking alerts and updates"
              onPress={onNotifications}
            />

            <View className="h-2" />

            <SettingRow
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              subtitle="Control your account data and security"
              onPress={onPrivacy}
            />
          </View>

          {/* Switch to rider */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSwitchToRider}
            className="mb-5 min-h-[80px] flex-row items-center rounded-2xl border border-[#E11D48]/40 bg-[#111B2A] px-4 py-3"
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30">
              <MaterialCommunityIcons
                name="motorbike"
                size={26}
                color="#E11D48"
              />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-[15px] font-extrabold text-white">
                Switch to Rider Mode
              </Text>
              <Text className="mt-0.5 text-xs text-slate-400">
                Accept delivery runs and earn money across Lagos
              </Text>
            </View>

            <View className="rounded-full border border-[#E11D48] bg-[#E11D48]/10 px-3 py-2">
              <Text className="text-xs font-bold text-[#E11D48]">
                Switch Now
              </Text>
            </View>
          </TouchableOpacity>

          {/* Support and about */}
          <View className="mb-5">
            <SettingRow
              icon="headset-outline"
              title="Support & Help"
              subtitle="Get help or contact dispatch support"
              onPress={onSupport}
            />

            <View className="h-2" />

            <SettingRow
              icon="information-circle-outline"
              title="About CodaExpress"
              subtitle="App version, terms and policies"
              onPress={onAbout}
              trailing={
                <View className="flex-row items-center">
                  <Text className="mr-3 text-xs font-medium text-slate-400">
                    v2.8.0
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#64748B"
                  />
                </View>
              }
            />
          </View>

          {/* Logout */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            className="mb-5 h-14 flex-row items-center justify-center rounded-2xl bg-rose-950/40 border border-rose-900/50"
          >
            <Ionicons name="log-out-outline" size={20} color="#FB7185" />
            <Text className="ml-2 text-sm font-extrabold text-rose-400">
              Log Out of CodaExpress
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}