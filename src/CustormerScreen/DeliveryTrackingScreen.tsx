import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Clipboard,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { CustomerStackParamList } from "./Navigation/CustomerTabs";
import DeliveryProgress from "./DeliveryProgress";
import type { RideOption } from "./RideOptionsScreen";
import type { Place } from "./RouteSearchScreen";

const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (token) Mapbox.setAccessToken(token);

export type DeliveryRoute = { pickup: Place; dropoff: Place };
export type DeliveryStatus =
  | "searching" | "assigned" | "arriving" | "picked_up"
  | "in_transit" | "delivered" | "cancelled";
export type RiderPosition = [number, number];
export type ChatMessage = {
  id: string;
  sender: "customer" | "rider";
  text: string;
  time: string;
};
export type DeliveryTrackingData = {
  orderId: string;
  status: DeliveryStatus;
  riderName?: string;
  riderPhone?: string;
  riderRating?: string;
  riderTrips?: number;
  riderAvatar?: any;
  deliveryPin?: string;
  etaMins?: number;
  distanceKm?: number;
  riderCoordinates?: RiderPosition;
  updatedAt?: string;
};

type Props = {
  route?: DeliveryRoute;
  vehicle?: RideOption;
  tracking?: DeliveryTrackingData;
  onBack?: () => void;
  onRefresh?: () => void;
  chatMessages?: ChatMessage[];
  onSendMessage?: (text: string, orderId: string) => Promise<void>;
};

const validCoords = (v: unknown): v is RiderPosition =>
  Array.isArray(v) && v.length === 2 &&
  v.every((n) => typeof n === "number" && Number.isFinite(n)) &&
  Math.abs(v[0]) <= 180 && Math.abs(v[1]) <= 90;

export default function DeliveryTrackingScreen({
  route: propRoute,
  vehicle,
  tracking: propTracking,
  onBack,
  onRefresh,
  chatMessages,
  onSendMessage,
}: Props) {
  const insets = useSafeAreaInsets();
  const navRoute = useRoute<RouteProp<CustomerStackParamList, "DeliveryTracking">>();
  
  const cameraRef = useRef<Mapbox.Camera>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Extract orderId safely from navigation params or props
  const paramOrderId = navRoute.params?.orderId;

  // SAFE TRACKING FALLBACK
  const tracking: DeliveryTrackingData = propTracking || {
    orderId: paramOrderId || "CDX-89241",
    status: "arriving",
    riderName: "Ayoade",
    riderPhone: "+2348031234567",
    riderRating: "5.0",
    riderTrips: 120,
    etaMins: 4,
    distanceKm: 2.1,
    riderCoordinates: [3.3820, 6.5260],
  };

  // SAFE ROUTE FALLBACK
  const route = propRoute || {
    pickup: {
      id: "p1",
      name: "Bola Matanmi St",
      address: "Bola Matanmi St, Lagos",
      coordinates: [3.3792, 6.5244],
    },
    dropoff: {
      id: "d1",
      name: "Royal Garden Estate",
      address: "Royal Garden Estate, Lekki",
      coordinates: [3.3850, 6.5280],
    },
  };

  const pickup = route?.pickup?.coordinates;
  const dropoff = route?.dropoff?.coordinates;
  const hasPickup = validCoords(pickup);
  const hasDropoff = validCoords(dropoff);
  const hasRider = validCoords(tracking.riderCoordinates);
  const assigned = !["searching", "cancelled"].includes(tracking.status) && !!tracking.riderName;
  const messages = chatMessages ?? localMessages;
  const canChat = assigned && tracking.status !== "delivered";

  const accountNumber = "8132347170";
  const amountToPay = "₦7,600";

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const center = useMemo<RiderPosition>(() => {
    if (hasRider) return tracking.riderCoordinates!;
    if (hasPickup && hasDropoff) return [(pickup[0] + dropoff[0]) / 2, (pickup[1] + dropoff[1]) / 2];
    if (hasPickup) return pickup;
    if (hasDropoff) return dropoff;
    return [3.3792, 6.5244];
  }, [hasRider, hasPickup, hasDropoff, tracking.riderCoordinates, pickup, dropoff]);

  const handleCopyAccount = () => {
    Clipboard.setString(accountNumber);
    setCopied(true);
    Alert.alert("Copied!", "Account number copied to clipboard.");
    setTimeout(() => setCopied(false), 3000);
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending || !canChat) return;
    setSending(true);
    try {
      if (onSendMessage) {
        await onSendMessage(text, tracking.orderId);
      } else {
        setLocalMessages((prev) => [...prev, {
          id: `${Date.now()}-${prev.length}`,
          sender: "customer",
          text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
      }
      setDraft("");
    } catch {
      Alert.alert("Error", "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* 1. MAPBOX MAP BACKGROUND */}
      <View className="absolute inset-0 bg-[#0B101D]">
        {token ? (
          <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Dark} scaleBarEnabled={false} logoEnabled={false} attributionEnabled={false}>
            <Mapbox.Camera ref={cameraRef} zoomLevel={14.5} centerCoordinate={center} />
            {hasPickup && (
              <Mapbox.MarkerView id="pickup-marker" coordinate={pickup}>
                <View className="w-8 h-8 rounded-full bg-[#10B981] border-2 border-white items-center justify-center">
                  <Ionicons name="radio-button-on" size={14} color="#FFF" />
                </View>
              </Mapbox.MarkerView>
            )}
            {hasDropoff && (
              <Mapbox.MarkerView id="dropoff-marker" coordinate={dropoff}>
                <View className="w-8 h-8 rounded-full bg-[#E11D48] border-2 border-white items-center justify-center">
                  <Ionicons name="location" size={16} color="#FFF" />
                </View>
              </Mapbox.MarkerView>
            )}
            {hasRider && (
              <Mapbox.MarkerView id="rider-marker" coordinate={tracking.riderCoordinates!}>
                <View className="w-10 h-10 rounded-full bg-[#090D16] border-2 border-[#E11D48] items-center justify-center shadow-xl">
                  <Ionicons name="bicycle" size={20} color="#E11D48" />
                </View>
              </Mapbox.MarkerView>
            )}
          </Mapbox.MapView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-slate-500 text-xs">Mapbox Token Missing</Text>
          </View>
        )}
      </View>

      {/* 2. FLOATING TOP STATUS CARD */}
      <View 
        className="absolute left-4 right-4 z-10 bg-slate-950/90 border border-slate-800 px-4 py-3 rounded-2xl flex-row items-center justify-between shadow-2xl backdrop-blur-md"
        style={{ top: insets.top + 10 }}
      >
        <TouchableOpacity onPress={onBack} className="w-9 h-9 rounded-full bg-slate-900 items-center justify-center border border-slate-800">
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-1 mx-3">
          <Text className="text-white text-xs font-bold" numberOfLines={1}>
            Rider arriving in ~{tracking.etaMins || 4} min
          </Text>
          <Text className="text-slate-400 text-[10px]">
            {vehicle?.name || "Motorbike"} • Order #{tracking.orderId}
          </Text>
        </View>

        <TouchableOpacity onPress={onRefresh} className="w-9 h-9 rounded-full bg-slate-900 items-center justify-center border border-slate-800">
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 3. BOTTOM TRACKING SHEET */}
      <ScrollView
        className="absolute bottom-0 left-0 right-0 bg-[#090D16] rounded-t-[32px] border-t border-slate-800 px-5 pt-3 z-10 max-h-[72%]"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 30) }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-12 h-1.5 rounded-full bg-slate-700 self-center mb-4" />

        {/* STATUS HEADER BANNER */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-3.5 mb-4 flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-xl bg-[#E11D48]/10 items-center justify-center">
            <Ionicons name="swap-horizontal" size={18} color="#E11D48" />
          </View>
          <Text className="text-white text-xs font-bold flex-1">
            Driver is finishing the previous ride, then heading to you
          </Text>
        </View>

        {/* RIDER & QUICK ACTIONS ROW */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="items-center">
            <View className="w-14 h-14 rounded-full bg-slate-800 border-2 border-[#E11D48] overflow-hidden items-center justify-center relative">
              {tracking.riderAvatar ? (
                <Image source={tracking.riderAvatar} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={28} color="#94A3B8" />
              )}
              <View className="absolute bottom-0 right-0 bg-amber-500 px-1 rounded-full flex-row items-center">
                <Text className="text-black text-[9px] font-black">★ {tracking.riderRating || "5.0"}</Text>
              </View>
            </View>
            <Text className="text-white text-xs font-bold mt-1">
              {tracking.riderName || "Ayoade"}
            </Text>
          </View>

          {/* ACTION BUTTONS */}
          <View className="flex-row items-center gap-6">
            <TouchableOpacity 
              onPress={() => setChatOpen(true)}
              className="items-center"
            >
              <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center shadow-lg">
                <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
              </View>
              <Text className="text-slate-300 text-[10px] font-bold mt-1">Contact driver</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => Alert.alert("Emergency Safety", "Dialing emergency services...")}
              className="items-center"
            >
              <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center shadow-lg">
                <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
              </View>
              <Text className="text-slate-300 text-[10px] font-bold mt-1">Safety</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PICKUP NOTES CARD */}
        <TouchableOpacity 
          className="bg-[#111B2A] border border-slate-800 rounded-2xl p-3.5 mb-4 flex-row items-center justify-between"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="chatbox-text-outline" size={18} color="#94A3B8" />
            <Text className="text-slate-300 text-xs font-bold">
              Any pickup notes for driver?
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </TouchableOpacity>

        {/* PAY TO DRIVER / BANK TRANSFER CARD */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4">
          <Text className="text-white text-base font-extrabold mb-3">
            Pay to driver {amountToPay}
          </Text>

          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center">
              <Ionicons name="wallet-outline" size={18} color="#10B981" />
            </View>
            <View>
              <Text className="text-white text-sm font-black tracking-widest">
                {accountNumber}
              </Text>
              <Text className="text-slate-400 text-[10px]">Bank Transfer</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCopyAccount}
            className="bg-emerald-500 rounded-xl py-3 items-center justify-center shadow-lg"
            activeOpacity={0.85}
          >
            <Text className="text-slate-950 text-xs font-black">
              {copied ? "Copied to Clipboard!" : "Copy transfer details"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ROUTE INFO */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4">
          <Text className="text-slate-400 text-[10px] font-bold uppercase mb-3">Your current ride</Text>
          <View className="flex-row items-center mb-3">
            <View className="w-3 h-3 rounded-full bg-emerald-500 mr-3" />
            <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
              {route?.pickup?.name || "Bola Matanmi St"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#E11D48] mr-3" />
            <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
              {route?.dropoff?.name || "Royal Garden Estate"}
            </Text>
          </View>
        </View>

        {/* CANCEL RIDE BUTTON */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Cancel Delivery", "Are you sure you want to cancel this order?", [
              { text: "No", style: "cancel" },
              { text: "Yes, Cancel", style: "destructive", onPress: onBack }
            ]);
          }}
          className="bg-slate-900 border border-slate-800 rounded-2xl py-4 items-center justify-center mb-4"
          activeOpacity={0.8}
        >
          <Text className="text-rose-500 font-bold text-sm">
            Cancel the delivery
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 4. CHAT MODAL */}
      <Modal visible={chatOpen} animationType="slide" transparent onRequestClose={() => setChatOpen(false)}>
        <View className="flex-1 bg-[#030712CC] justify-end" style={{ paddingBottom: Platform.OS === "android" && keyboardHeight > 0 ? keyboardHeight : 0 }}>
          <View className="bg-[#090D16] rounded-t-[28px] border-t border-slate-800 overflow-hidden" style={{ height: keyboardHeight > 0 ? "85%" : "70%" }}>
            <View className="px-4 py-4 flex-row items-center border-b border-slate-800">
              <View className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Ionicons name="chatbubbles" size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">{tracking.riderName || "Ayoade"}</Text>
                <Text className="text-slate-400 text-[10px]">Order #{tracking.orderId}</Text>
              </View>
              <TouchableOpacity onPress={() => setChatOpen(false)} className="p-1">
                <Ionicons name="close" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView ref={chatScrollRef} className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}>
              {messages.map((msg) => (
                <View key={msg.id} className={`max-w-[80%] rounded-2xl px-4 py-2.5 mb-2 ${msg.sender === "customer" ? "self-end bg-[#E11D48]" : "self-start bg-slate-800"}`}>
                  <Text className="text-white text-xs">{msg.text}</Text>
                  <Text className="text-slate-300 text-[9px] mt-1 self-end">{msg.time}</Text>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row items-center p-3 border-t border-slate-800 bg-[#0F172A]">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Be polite while chatting..."
                placeholderTextColor="#64748B"
                className="flex-1 bg-slate-800 rounded-xl px-4 py-2.5 text-white text-xs mr-2"
              />
              <TouchableOpacity onPress={sendMessage} disabled={!draft.trim()} className={`w-10 h-10 rounded-xl items-center justify-center ${draft.trim() ? "bg-[#E11D48]" : "bg-slate-800"}`}>
                <Ionicons name="send" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}