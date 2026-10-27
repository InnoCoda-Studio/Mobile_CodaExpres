import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Dimensions,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  route: DeliveryRoute;
  vehicle: RideOption;
  tracking: DeliveryTrackingData;
  onBack: () => void;
  onRefresh?: () => void;
  // Optional real chat integration. Without these, chat is a local demo only.
  chatMessages?: ChatMessage[];
  onSendMessage?: (text: string, orderId: string) => Promise<void>;
};

const validCoords = (v: unknown): v is RiderPosition =>
  Array.isArray(v) && v.length === 2 &&
  v.every((n) => typeof n === "number" && Number.isFinite(n)) &&
  Math.abs(v[0]) <= 180 && Math.abs(v[1]) <= 90;

const STATUS: Record<DeliveryStatus, { title: string; detail: string }> = {
  searching: { title: "Finding your rider", detail: "Searching for an available rider" },
  assigned: { title: "Rider assigned", detail: "Your rider is preparing for pickup" },
  arriving: { title: "Heading to pickup", detail: "Your rider is travelling to the pickup point" },
  picked_up: { title: "Package collected", detail: "Your package is now with the rider" },
  in_transit: { title: "On the way to you", detail: "Your package is heading to the destination" },
  delivered: { title: "Delivery completed", detail: "Delivery has been confirmed" },
  cancelled: { title: "Order cancelled", detail: "This delivery is no longer active" },
};

function InfoRow({ icon, label, value, color }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-row items-center py-2">
      <View className="w-9 h-9 rounded-xl bg-[#0F172A] items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-[#94A3B8] text-[11px]">{label}</Text>
        <Text className="text-white font-semibold text-sm mt-1" numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

export default function DeliveryTrackingScreen({
  route, vehicle, tracking, onBack, onRefresh, chatMessages, onSendMessage,
}: Props) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Mapbox.Camera>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const pickup = route?.pickup?.coordinates;
  const dropoff = route?.dropoff?.coordinates;
  const hasPickup = validCoords(pickup);
  const hasDropoff = validCoords(dropoff);
  const hasRider = validCoords(tracking.riderCoordinates);
  const assigned = !["searching", "cancelled"].includes(tracking.status) && !!tracking.riderName;
  const messages = chatMessages ?? localMessages;
  const canChat = assigned && tracking.status !== "delivered";



  useEffect(() => {
    setLocalMessages([]);
    setDraft("");
    setChatOpen(false);
  }, [tracking.orderId]);

  const center = useMemo<RiderPosition>(() => {
    if (hasRider) return tracking.riderCoordinates!;
    if (hasPickup && hasDropoff) return [(pickup[0] + dropoff[0]) / 2, (pickup[1] + dropoff[1]) / 2];
    if (hasPickup) return pickup;
    if (hasDropoff) return dropoff;
    return [3.3792, 6.5244];
  }, [hasRider, hasPickup, hasDropoff, tracking.riderCoordinates, pickup, dropoff]);

  const fitRoute = () => {
    const points: RiderPosition[] = [];
    if (hasPickup) points.push(pickup);
    if (hasDropoff) points.push(dropoff);
    if (hasRider) points.push(tracking.riderCoordinates!);
    if (points.length > 1) {
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      cameraRef.current?.fitBounds(
        [Math.max(...xs), Math.max(...ys)],
        [Math.min(...xs), Math.min(...ys)],
        [65, 45, 65, 45],
        700
      );
    } else {
      cameraRef.current?.setCamera({ centerCoordinate: center, zoomLevel: 14, animationDuration: 700 });
    }
  };

  const callRider = async () => {
    if (!assigned || !tracking.riderPhone?.trim()) {
      Alert.alert("Call unavailable", "The assigned rider's contact number is not available.");
      return;
    }
    const phone = tracking.riderPhone.replace(/[^\d+]/g, "");
    if (!/^\+?\d{7,15}$/.test(phone)) {
      Alert.alert("Call unavailable", "The rider's contact number is invalid.");
      return;
    }
    try { await Linking.openURL(`tel:${phone}`); }
    catch { Alert.alert("Call unavailable", "Unable to open the phone dialer."); }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending || !canChat) return;
    setSending(true);
    try {
      if (onSendMessage) {
        await onSendMessage(text, tracking.orderId);
        // Parent supplies chatMessages from backend; do not fake delivery.
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
      Alert.alert("Message not sent", "Please check your connection and try again.");
    } finally { setSending(false); }
  };

  const pin = tracking.deliveryPin;
  const showPin = ["picked_up", "in_transit"].includes(tracking.status) &&
    typeof pin === "string" && /^\d{4}$/.test(pin);
  const etaText = typeof tracking.etaMins === "number" && tracking.etaMins >= 0
    ? `${Math.round(tracking.etaMins)} min ETA` : "ETA pending";
  const distanceText = typeof tracking.distanceKm === "number" && tracking.distanceKm >= 0
    ? `${tracking.distanceKm.toFixed(1)} km` : "Distance pending";
  const stage = STATUS[tracking.status];

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <View className="flex-1 bg-[#090D16]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1E293B]">
        <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center rounded-xl bg-[#1E293B]">
          <Ionicons name="arrow-back" size={21} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="items-center flex-1">
          <Text className="text-white font-extrabold text-base">Track Delivery</Text>
          <Text className="text-[#94A3B8] text-[11px]" numberOfLines={1}>#{tracking.orderId}</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} disabled={!onRefresh} className="w-10 h-10 items-center justify-center rounded-xl bg-[#1E293B]">
          <Ionicons name="refresh" size={19} color={onRefresh ? "#FFFFFF" : "#64748B"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 30 }}>
        <View className="mt-4 rounded-3xl border border-[#334155] overflow-hidden bg-[#0F172A] h-[270px]">
          {token ? (
            <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}
              scaleBarEnabled={false} compassEnabled logoEnabled attributionEnabled>
              <Mapbox.Camera ref={cameraRef} zoomLevel={12} centerCoordinate={center} />
              {hasPickup && <Mapbox.MarkerView id="delivery-pickup" coordinate={pickup}>
                <View className="bg-[#10B981] w-8 h-8 rounded-full border-2 border-white items-center justify-center">
                  <Ionicons name="cube" size={15} color="#FFFFFF" />
                </View>
              </Mapbox.MarkerView>}
              {hasDropoff && <Mapbox.MarkerView id="delivery-dropoff" coordinate={dropoff}>
                <View className="bg-[#E11D48] w-8 h-8 rounded-full border-2 border-white items-center justify-center">
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                </View>
              </Mapbox.MarkerView>}
              {hasRider && <Mapbox.MarkerView id="delivery-rider" coordinate={tracking.riderCoordinates!}>
                <View className="bg-[#0F172A] w-10 h-10 rounded-full border-2 border-[#38BDF8] items-center justify-center">
                  <Ionicons name={vehicle.id === "3" ? "car" : "bicycle"} size={19} color="#38BDF8" />
                </View>
              </Mapbox.MarkerView>}
            </Mapbox.MapView>
          ) : (
            <View className="flex-1 items-center justify-center px-4">
              <Ionicons name="map-outline" size={35} color="#94A3B8" />
              <Text className="text-[#94A3B8] text-xs text-center mt-2">Map unavailable: Mapbox token is missing</Text>
            </View>
          )}
          <View className="absolute top-3 left-3 bg-[#0F172A] px-3 py-2 rounded-full flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${hasRider ? "bg-[#34D399]" : "bg-[#FBBF24]"}`} />
            <Text className="text-white text-xs font-semibold">{hasRider ? "Rider location available" : "Awaiting rider location"}</Text>
          </View>
          {token && <TouchableOpacity onPress={fitRoute} className="absolute bottom-3 right-3 bg-[#0F172A] w-10 h-10 rounded-full items-center justify-center border border-[#334155]">
            <Ionicons name="locate" size={20} color="#FFFFFF" />
          </TouchableOpacity>}
        </View>

        <View className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 mt-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-[#E11D4820] rounded-2xl items-center justify-center mr-3">
              <Ionicons name="navigate" size={22} color="#FB7185" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-extrabold">{stage.title}</Text>
              <Text className="text-[#94A3B8] text-xs mt-1">{stage.detail}</Text>
            </View>
          </View>
          <View className="flex-row mt-4 pt-4 border-t border-[#334155]">
            <View className="flex-1 flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#38BDF8" />
              <Text className="text-[#CBD5E1] text-xs ml-2">{etaText}</Text>
            </View>
            <View className="flex-1 flex-row items-center justify-end">
              <Ionicons name="speedometer-outline" size={16} color="#38BDF8" />
              <Text className="text-[#CBD5E1] text-xs ml-2">{distanceText}</Text>
            </View>
          </View>
        </View>

        <View className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 mt-4">
          <Text className="text-white text-base font-extrabold mb-2">Delivery Route</Text>
          <InfoRow icon="radio-button-on" color="#34D399" label="Pickup" value={(route?.pickup as any)?.name ?? (route?.pickup as any)?.address ?? "Pickup location"} />
          <View className="ml-[17px] h-4 border-l-2 border-dashed border-[#475569]" />
          <InfoRow icon="location" color="#FB7185" label="Drop-off" value={(route?.dropoff as any)?.name ?? (route?.dropoff as any)?.address ?? "Delivery destination"} />
        </View>

        <View className="mt-4">
          <DeliveryProgress status={tracking.status} />
        </View>

        {showPin && (
          <View className="bg-[#1E293B] border border-[#E11D4866] rounded-3xl p-5 mt-1 items-center">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={19} color="#FB7185" />
              <Text className="text-white font-extrabold ml-2">Delivery Confirmation PIN</Text>
            </View>
            <Text className="text-[#94A3B8] text-xs text-center mb-4">Only share this PIN after receiving and checking your package.</Text>
            <View className="flex-row gap-2">
              {pin!.split("").map((digit, index) => (
                <View key={index} className="w-14 h-16 rounded-2xl bg-[#0F172A] border border-[#334155] items-center justify-center">
                  <Text className="text-white text-2xl font-extrabold">{digit}</Text>
                </View>
              ))}
            </View>
            <Text className="text-[#FB7185] text-[11px] mt-4 text-center">The rider cannot complete delivery without backend PIN verification.</Text>
          </View>
        )}

        <View className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 mt-4">
          <Text className="text-white font-extrabold text-base mb-4">Your Rider</Text>
          <View className="flex-row items-center">
            {tracking.riderAvatar ? (
              <Image source={tracking.riderAvatar} className="w-14 h-14 rounded-full" />
            ) : (
              <View className="w-14 h-14 rounded-full bg-[#0F172A] items-center justify-center">
                <Ionicons name="person" size={26} color="#94A3B8" />
              </View>
            )}
            <View className="flex-1 ml-3">
              <Text className="text-white font-bold text-base">{assigned ? tracking.riderName : "Rider not assigned"}</Text>
              {assigned && (tracking.riderRating || tracking.riderTrips !== undefined) && (
                <Text className="text-[#94A3B8] text-xs mt-1">
                  {tracking.riderRating ? `★ ${tracking.riderRating}` : ""}
                  {tracking.riderTrips !== undefined ? `  ·  ${tracking.riderTrips} trips` : ""}
                </Text>
              )}
              <Text className="text-[#94A3B8] text-xs mt-1">Order #{tracking.orderId}</Text>
            </View>
          </View>
          <View className="flex-row gap-3 mt-5">
            <TouchableOpacity disabled={!canChat} onPress={() => setChatOpen(true)}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl ${canChat ? "bg-[#E11D48]" : "bg-[#334155]"}`}>
              <Ionicons name="chatbubble-ellipses-outline" size={19} color="#FFFFFF" />
              <Text className="text-white font-bold ml-2">Message</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={!assigned} onPress={callRider}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl ${assigned ? "bg-[#0284C7]" : "bg-[#334155]"}`}>
              <Ionicons name="call-outline" size={19} color="#FFFFFF" />
              <Text className="text-white font-bold ml-2">Call Rider</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-[#64748B] text-[11px] text-center mt-5">Tracking details update when new order data is received.</Text>
      </ScrollView>

<Modal
  visible={chatOpen}
  animationType="slide"
  transparent
  statusBarTranslucent={false}
  navigationBarTranslucent={false}
  onRequestClose={() => setChatOpen(false)}
>
 <View
  className="flex-1 bg-[#030712CC] justify-end"
  style={{
    paddingBottom:
      Platform.OS === "android" && keyboardHeight > 0
        ? keyboardHeight + 50
        : 0,
  }}
>
    {/* TAP OUTSIDE TO CLOSE */}
    <TouchableOpacity
      className="flex-1"
      activeOpacity={1}
      onPress={() => setChatOpen(false)}
    />

    {/* CHAT BOTTOM SHEET */}
    <View
      className="bg-[#0F172A] rounded-t-[28px] border-t border-[#334155] overflow-hidden"
      style={{
        height: keyboardHeight > 0 ? "90%" : "75%",
        paddingBottom:
          keyboardHeight > 0
            ? 8
            : Math.max(insets.bottom, 10),
      }}
    >
      {/* CHAT HEADER */}
      <View className="px-4 py-4 flex-row items-center border-b border-[#334155]">
        <View className="w-10 h-10 rounded-full bg-[#1E293B] items-center justify-center mr-3">
          <Ionicons
            name="chatbubbles-outline"
            size={20}
            color="#38BDF8"
          />
        </View>

        <View className="flex-1">
          <Text className="text-white font-extrabold text-base">
            {tracking.riderName ?? "Rider"}
          </Text>

          <Text className="text-[#94A3B8] text-[11px] mt-1">
            Order #{tracking.orderId}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setChatOpen(false)}
          className="w-9 h-9 items-center justify-center"
        >
          <Ionicons
            name="close"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* CHAT PREVIEW NOTICE */}
      {!onSendMessage && (
        <View className="px-4 py-2 bg-[#1E293B]">
          <Text className="text-[#FBBF24] text-[11px] text-center">
            Chat preview only — messages are not sent to the rider yet.
          </Text>
        </View>
      )}

      {/* CHAT MESSAGES */}
      <ScrollView
        ref={chatScrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          justifyContent: "flex-end",
        }}
        onContentSizeChange={() =>
          chatScrollRef.current?.scrollToEnd({
            animated: true,
          })
        }
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="chatbubble-outline"
              size={36}
              color="#64748B"
            />

            <Text className="text-white font-bold text-base mt-3">
              No messages yet
            </Text>

            <Text className="text-[#94A3B8] text-xs text-center mt-2">
              Ask your rider about pickup or delivery instructions.
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              className={`max-w-[82%] rounded-2xl px-4 py-3 mb-3 ${
                msg.sender === "customer"
                  ? "self-end bg-[#E11D48] rounded-br-sm"
                  : "self-start bg-[#1E293B] rounded-bl-sm"
              }`}
            >
              <Text className="text-white text-sm leading-5">
                {msg.text}
              </Text>

              <Text className="text-[#E2E8F0] text-[10px] mt-1 self-end">
                {msg.time}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* MESSAGE INPUT */}
      <View className="flex-row items-end px-3 pt-3 pb-2 border-t border-[#334155] bg-[#0F172A]">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message your rider..."
          placeholderTextColor="#64748B"
          multiline
          maxLength={1000}
          textAlignVertical="center"
          returnKeyType="default"
          className="flex-1 bg-[#1E293B] rounded-2xl px-4 py-3 text-white text-sm mr-2"
          style={{
            minHeight: 46,
            maxHeight: 110,
          }}
        />

        <TouchableOpacity
          onPress={sendMessage}
          disabled={!draft.trim() || sending}
          activeOpacity={0.8}
          className={`w-12 h-12 rounded-2xl items-center justify-center ${
            draft.trim() && !sending
              ? "bg-[#E11D48]"
              : "bg-[#334155]"
          }`}
        >
          <Ionicons
            name="send"
            size={19}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
}
