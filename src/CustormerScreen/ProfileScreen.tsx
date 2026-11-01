
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
  iconColor = "#0EA5E9",
}: SettingRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="min-h-[76px] flex-row items-center rounded-2xl border border-[#16436A] bg-[#0C1B30] px-4 py-3"
    >
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#082B49]">
        <Ionicons name={icon} size={29} color={iconColor} />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-[16px] font-bold text-white">
          {title}
        </Text>
        <Text className="mt-0.5 text-[13px] text-[#A8C9E9]">
          {subtitle}
        </Text>
      </View>

      {trailing || (
        <Ionicons name="chevron-forward" size={23} color="#A8C9E9" />
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
    <View className="flex-1 bg-[#070F1D]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#071426"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 20,
        }}
      >
        {/* Header */}
        <View className="border-b border-[#102C49] bg-[#08172A] px-5 pb-4">
          <View
            className="flex-row items-center justify-between"
            style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
          >
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={29} color="#FFFFFF" />
            </TouchableOpacity>
            

            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/codaexpress-logo.png")}
                resizeMode="contain"
                className="mr-2 h-10 w-10"
              />

              <Text className="text-[21px] font-extrabold tracking-tight text-white">
                Coda
                <Text className="text-brand">Express</Text>
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className="relative h-11 w-11 items-center justify-center"
            >
              <Ionicons
                name="notifications-outline"
                size={27}
                color="#FFFFFF"
              />
              <View className="absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full bg-[#E11D48]">
                <Text className="text-[11px] font-bold text-white">3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 pt-5">
          {/* Page title */}
          <View className="mb-5">
            <Text className="text-[29px] font-extrabold text-white">
              Settings
            </Text>
            <Text className="mt-1 text-[14px] text-[#A8C9E9]">
              Manage your account and preferences
            </Text>
          </View>

          {/* Profile card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onEditProfile}
            className="mb-5 flex-row items-center rounded-2xl border border-[#165080] bg-[#0C1B30] p-4"
          >
            <View className="relative">
              <View className="h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#0EA5E9] bg-[#183B59]">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={54}
                    color="#A8C9E9"
                  />
                )}
              </View>

              <View className="absolute bottom-0 right-[-3px] h-9 w-9 items-center justify-center rounded-full border-2 border-[#0C1B30] bg-[#071426]">
                <Ionicons name="camera-outline" size={19} color="#FFFFFF" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <View className="mb-2 flex-row flex-wrap items-center">
                <Text className="mr-2 text-[19px] font-extrabold text-white">
                  {fullName}
                </Text>

                <View className="flex-row items-center rounded-full bg-[#075B9C] px-2.5 py-1">
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color="#BAE6FD"
                  />
                  <Text className="ml-1 text-[11px] font-bold text-white">
                    Verified
                  </Text>
                </View>
              </View>

              <View className="mb-1 flex-row items-center">
                <Ionicons name="call-outline" size={16} color="#A8C9E9" />
                <Text className="ml-2 text-[13px] text-white">
                  {phoneNumber}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={17} color="#A8C9E9" />
                <Text
                  numberOfLines={1}
                  className="ml-2 flex-1 text-[13px] text-[#A8C9E9]"
                >
                  {email}
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Account settings */}
          <View className="mb-5">
            <SettingRow
              icon="location"
              title="My Addresses"
              subtitle="Manage delivery addresses"
              onPress={onAddresses}
            />

            <View className="h-0.5" />

            <SettingRow
              icon="card"
              title="Payment Methods"
              subtitle="Cards, Wallets & More"
              onPress={onPaymentMethods}
              trailing={
                <View className="flex-row items-center">
                  <View className="mr-1 rounded-md bg-[#123D86] px-2 py-1">
                    <Text className="text-[12px] font-extrabold italic text-white">
                      VISA
                    </Text>
                  </View>
                  <View className="mr-1 flex-row items-center rounded-md bg-[#101C2D] px-2 py-1">
                    <View className="h-4 w-4 rounded-full bg-[#EB001B]" />
                    <View className="-ml-1.5 h-4 w-4 rounded-full bg-[#F79E1B] opacity-90" />
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#A8C9E9" />
                </View>
              }
            />

            <View className="h-0.5" />

            <SettingRow
              icon="cash"
              title="Currency & Location"
              subtitle="NGN  ₦ • Lagos, Nigeria"
              onPress={onCurrency}
              trailing={
                <View className="flex-row items-center">
                  <Text className="mr-3 text-xl">🇳🇬</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={23}
                    color="#A8C9E9"
                  />
                </View>
              }
            />
          </View>

          {/* Appearance */}
          <View className="mb-2 min-h-[76px] flex-row items-center rounded-2xl border border-[#16436A] bg-[#0C1B30] px-4 py-3">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#082B49]">
              <Ionicons name="sunny" size={29} color="#FBBF24" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-[16px] font-bold text-white">
                Appearance
              </Text>
              <Text className="mt-0.5 text-[13px] text-[#A8C9E9]">
                Choose your preferred theme
              </Text>
            </View>

            <View className="flex-row rounded-full border border-[#16436A] bg-[#102B48] p-1">
              <TouchableOpacity
                onPress={() => setTheme("dark")}
                className={`rounded-full px-4 py-2 ${
                  theme === "dark" ? "bg-[#0EA5E9]" : ""
                }`}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    theme === "dark" ? "text-white" : "text-[#A8C9E9]"
                  }`}
                >
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTheme("light")}
                className={`rounded-full px-4 py-2 ${
                  theme === "light" ? "bg-[#0EA5E9]" : ""
                }`}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    theme === "light" ? "text-white" : "text-[#A8C9E9]"
                  }`}
                >
                  Light
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences */}
          <View className="mb-5 mt-2">
            <SettingRow
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage alerts and updates"
              onPress={onNotifications}
            />

            <View className="h-2" />

            <SettingRow
              icon="shield-checkmark"
              title="Privacy & Security"
              subtitle="Control your data and security"
              onPress={onPrivacy}
            />
          </View>

          {/* Switch to rider */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSwitchToRider}
            className="mb-4 min-h-[84px] flex-row items-center rounded-2xl border border-[#029DEB] bg-[#0B2039] px-4 py-3"
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#082B49]">
              <MaterialCommunityIcons
                name="motorbike"
                size={32}
                color="#0EA5E9"
              />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-[16px] font-extrabold text-white">
                Switch to Rider Mode
              </Text>
              <Text className="mt-0.5 text-[13px] text-[#A8C9E9]">
                Become a rider and earn money
              </Text>
            </View>

            <View className="rounded-full border-2 border-[#029DEB] px-4 py-2.5">
              <Text className="text-[13px] font-bold text-[#0EA5E9]">
                Switch Now
              </Text>
            </View>
          </TouchableOpacity>

          {/* Support and about */}
          <View className="mb-5">
            <SettingRow
              icon="headset"
              title="Support & Help"
              subtitle="Get help or contact support"
              onPress={onSupport}
            />

            <View className="h-2" />

            <SettingRow
              icon="information-circle"
              title="About CodaExpress"
              subtitle="App version, terms and more"
              onPress={onAbout}
              trailing={
                <View className="flex-row items-center">
                  <Text className="mr-3 text-[13px] font-medium text-[#A8C9E9]">
                    v2.8.0
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={23}
                    color="#A8C9E9"
                  />
                </View>
              }
            />
          </View>

          {/* Logout */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            className="mb-5 h-[55px] flex-row items-center justify-center rounded-2xl bg-[#E11D48]"
          >
            <Ionicons name="log-out-outline" size={23} color="#FFFFFF" />
            <Text className="ml-3 text-[17px] font-extrabold text-white">
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
