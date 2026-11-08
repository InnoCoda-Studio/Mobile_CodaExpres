import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  Animated,
  Easing,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (token) Mapbox.setAccessToken(token);

type Props = {
  walletBalance?: number;
  currencySymbol?: string;
  onTopUp?: () => void;
  onNavigateTab?: (tab: string) => void;
  onSimulateIncomingOrder?: (order?: any) => void;
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
  const [incomingOrder, setIncomingOrder] = useState<any>(null);

  // Urgent Acceptance Counter (15 seconds)
  const [timeLeft, setTimeLeft] = useState(15);

  // RADAR PULSE ANIMATION VALUES
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOnline) {
      // Loop radar pulse ring
      const radarLoop = Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      
      // Pulse status dot
      const dotLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotPulse, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(dotPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      radarLoop.start();
      dotLoop.start();

      const timer = setTimeout(() => {
        triggerSimulatedOrder();
      }, 6000);

      return () => {
        clearTimeout(timer);
        radarLoop.stop();
        dotLoop.stop();
      };
    } else {
      setIncomingOrder(null);
      pulseAnim.setValue(0);
      dotPulse.setValue(1);
    }
  }, [isOnline]);

  useEffect(() => {
    if (!incomingOrder) return;

    setTimeLeft(15);
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIncomingOrder(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [incomingOrder]);

  const triggerSimulatedOrder = () => {
    setIncomingOrder({
      id: "CDX-94821",
      pickup: "Bola Matanmi St, Lekki Phase 1",
      dropoff: "Royal Garden Estate, Ajah",
      distance: "4.2 km",
      estimatedEarnings: "₦2,600",
      customerName: "Paul O.",
      customerPhone: "+2348031234567",
      packageType: "Documents & Laptop Box",
    });
  };

  const handleAcceptOrder = () => {
    if (!incomingOrder) return;
    const acceptedOrder = { ...incomingOrder };
    setIncomingOrder(null);
    onSimulateIncomingOrder(acceptedOrder);
  };

  const handleDeclineOrder = () => {
    setIncomingOrder(null);
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* MAPBOX MAP & SEARCHING RADAR OVERLAY */}
      <View className="absolute inset-0 bg-[#0B101D]">
        {token ? (
          <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Dark}
            scaleBarEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <Mapbox.Camera
              defaultSettings={{
                centerCoordinate: [3.3792, 6.5244],
                zoomLevel: 14,
              }}
            />
          </Mapbox.MapView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-slate-500 text-xs">Mapbox Token Missing</Text>
          </View>
        )}

        {/* RADAR PULSE OVERLAY ON MAP */}
        {isOnline && !incomingOrder && (
          <View className="absolute inset-0 items-center justify-center pointer-events-none">
            {/* Outer Expanding Radar Ring */}
            <Animated.View
              style={{
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 2.5],
                    }),
                  },
                ],
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [0.6, 0.3, 0],
                }),
              }}
              className="w-48 h-48 rounded-full border-2 border-[#10B981] bg-[#10B981]/10"
            />

            {/* Inner Rider Marker Location */}
            <View className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981] items-center justify-center shadow-2xl absolute">
              <View className="w-6 h-6 rounded-full bg-[#E11D48] items-center justify-center border-2 border-white shadow-lg">
                <Ionicons name="bicycle" size={12} color="#FFFFFF" />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* FLOATING HEADER */}
      <View
        className="absolute left-4 right-4 z-20 bg-[#090D16]/95 border border-slate-800 p-3 rounded-3xl shadow-2xl backdrop-blur-md"
        style={{ top: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between mb-3 px-1">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-xl bg-[#E11D48] items-center justify-center shadow-lg">
              <Ionicons name="flash" size={16} color="#FFFFFF" />
            </View>
            <Text className="text-white text-base font-black tracking-tight">
              Coda<Text className="text-[#E11D48]">Express</Text>
              <Text className="text-slate-400 text-[10px] font-bold ml-1.5">• Rider</Text>
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={onTopUp}
              className="bg-[#111B2A] border border-slate-800 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5"
              activeOpacity={0.8}
            >
              <Ionicons name="wallet-outline" size={15} color="#10B981" />
              <Text className="text-emerald-400 text-xs font-black">
                {currencySymbol}{walletBalance.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert("Notifications", "No new dispatch alerts.")}
              className="w-8 h-8 rounded-xl bg-[#111B2A] border border-slate-800 items-center justify-center relative"
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={16} color="#FFFFFF" />
              <View className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigateTab("profile")}
              className="w-8 h-8 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/40 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={15} color="#E11D48" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ONLINE SEARCHING STATUS BADGE */}
        <View className="flex-row items-center justify-between bg-[#111B2A] border border-slate-800 px-3.5 py-2.5 rounded-2xl">
          <View className="flex-row items-center gap-2.5">
            <Animated.View
              style={{ opacity: isOnline ? dotPulse : 1 }}
              className={`w-3 h-3 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-600"}`}
            />
            <View>
              <Text className="text-white text-xs font-black">
                {isOnline ? "SEARCHING FOR ORDERS..." : "YOU ARE OFFLINE"}
              </Text>
              <Text className="text-slate-400 text-[9px]">
                {isOnline ? "Radar active • Stay in demand areas" : "Go online to start receiving package requests"}
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
      </View>

      {/* TEST TRIGGER BUTTON */}
      {isOnline && !incomingOrder && (
        <View className="absolute top-48 left-4 right-4 z-10 items-center">
          <TouchableOpacity
            onPress={triggerSimulatedOrder}
            className="bg-[#090D16]/90 border border-[#E11D48]/40 px-4 py-2.5 rounded-full flex-row items-center gap-2 shadow-xl backdrop-blur-md"
            activeOpacity={0.85}
          >
            <View className="w-2 h-2 rounded-full bg-[#E11D48]" />
            <Text className="text-white text-xs font-bold">⚡ Simulate Incoming Package Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QUICK STATS SHEET */}
      {!incomingOrder && (
        <View
          className="absolute bottom-6 left-4 right-4 bg-[#090D16] border border-slate-800 p-4 rounded-3xl shadow-2xl flex-row justify-between items-center"
          style={{ marginBottom: insets.bottom }}
        >
          <TouchableOpacity onPress={() => onNavigateTab("history")} className="flex-1 items-center border-r border-slate-800">
            <Text className="text-slate-400 text-[10px] uppercase font-bold">Today's Runs</Text>
            <Text className="text-white text-lg font-black mt-0.5">8</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTopUp} className="flex-1 items-center border-r border-slate-800">
            <Text className="text-slate-400 text-[10px] uppercase font-bold">Earnings</Text>
            <Text className="text-emerald-400 text-lg font-black mt-0.5">₦19,400</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onNavigateTab("profile")} className="flex-1 items-center">
            <Text className="text-slate-400 text-[10px] uppercase font-bold">Rating</Text>
            <Text className="text-amber-400 text-lg font-black mt-0.5">★ 4.95</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* INCOMING REQUEST MODAL */}
      <Modal visible={!!incomingOrder} animationType="slide" transparent onRequestClose={handleDeclineOrder}>
        <View className="flex-1 bg-[#030712CC] justify-end">
          <View className="bg-[#090D16] rounded-t-[32px] border-t border-slate-800 p-5 shadow-2xl" style={{ paddingBottom: Math.max(insets.bottom + 10, 20) }}>
            <View className="w-12 h-1.5 rounded-full bg-slate-700 self-center mb-4" />

            <View className="flex-row items-center justify-between mb-4">
              <View className="bg-[#E11D48]/10 border border-[#E11D48]/30 px-3 py-1 rounded-full flex-row items-center gap-2">
                <Ionicons name="time-outline" size={14} color="#E11D48" />
                <Text className="text-[#E11D48] text-xs font-black uppercase">Accept in {timeLeft}s</Text>
              </View>

              <Text className="text-emerald-400 text-2xl font-black">{incomingOrder?.estimatedEarnings}</Text>
            </View>

            <View className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
              <View className="h-full bg-[#E11D48] rounded-full" style={{ width: `${(timeLeft / 15) * 100}%` }} />
            </View>

            <Text className="text-white text-base font-extrabold mb-1">{incomingOrder?.packageType}</Text>
            <Text className="text-slate-400 text-xs mb-4">
              Customer: {incomingOrder?.customerName} • {incomingOrder?.distance} away
            </Text>

            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-5">
              <View className="flex-row items-center mb-3">
                <View className="w-3 h-3 rounded-full bg-emerald-500 mr-3" />
                <View className="flex-1">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold">Pickup</Text>
                  <Text className="text-white text-xs font-bold" numberOfLines={1}>{incomingOrder?.pickup}</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#E11D48] mr-3" />
                <View className="flex-1">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold">Drop-off</Text>
                  <Text className="text-white text-xs font-bold" numberOfLines={1}>{incomingOrder?.dropoff}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleDeclineOrder} className="flex-1 bg-slate-900 border border-slate-800 py-4 rounded-2xl items-center">
                <Text className="text-slate-400 font-bold text-sm">Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAcceptOrder} className="flex-1 bg-[#E11D48] py-4 rounded-2xl items-center shadow-lg">
                <Text className="text-white font-black text-sm">Accept Order ({timeLeft}s)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}