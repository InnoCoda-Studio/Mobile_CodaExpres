import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (token) Mapbox.setAccessToken(token);

type Props = {
  order?: {
    id: string;
    pickup: string;
    dropoff: string;
    distance: string;
    estimatedEarnings: string;
    customerName: string;
    customerPhone: string;
    packageType: string;
  };
  onBack?: () => void;
};

interface ChatMessage {
  id: string;
  sender: "customer" | "rider";
  text: string;
  time: string;
}

export default function ActiveOrderTrackerScreen({
  order = {
    id: "CDX-94821",
    pickup: "Bola Matanmi St, Lekki Phase 1",
    dropoff: "Royal Garden Estate, Ajah",
    distance: "4.2 km",
    estimatedEarnings: "₦2,600",
    customerName: "Paul O.",
    customerPhone: "+2348031234567",
    packageType: "Documents & Laptop Box",
  },
  onBack = () => {},
}: Props) {
  const insets = useSafeAreaInsets();

  const [deliveryStage, setDeliveryStage] = useState<"to_pickup" | "to_dropoff" | "completed">("to_pickup");
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "customer", text: "Hello rider, please be fast with the package!", time: "10:42 AM" },
  ]);
  const [inputText, setInputText] = useState("");

  // 1. CALL CUSTOMER
  const handleCallCustomer = () => {
    const phoneUrl = `tel:${order.customerPhone}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert("Call Failed", "Unable to open device dialer.");
    });
  };

  // 2. OPEN EXTERNAL MAPS (Google Maps / Mapbox / Apple Maps)
  const handleOpenExternalMaps = () => {
    const destination = deliveryStage === "to_pickup" ? order.pickup : order.dropoff;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(destination)}`,
      android: `geo:0,0?q=${encodeURIComponent(destination)}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Maps App Not Found",
        "Please download Google Maps or Mapbox from your app store to view turn-by-turn directions.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Get Google Maps",
            onPress: () => Linking.openURL("https://play.google.com/store/apps/details?id=com.google.android.apps.maps"),
          },
        ]
      );
    });
  };

  // 3. SEND CHAT MESSAGE
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "rider",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  // 4. CANCEL ORDER
  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order?",
      "Are you sure you want to cancel this delivery run? Penalty may apply.",
      [
        { text: "No, Keep Running", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            Alert.alert("Order Cancelled", "You have exited this run.");
            onBack();
          },
        },
      ]
    );
  };

  // 5. VERIFY PIN
  const handleVerifyPin = () => {
    if (enteredPin.length !== 4) {
      Alert.alert("Invalid PIN", "Please enter the 4-digit confirmation code provided by the customer.");
      return;
    }

    setPinModalVisible(false);
    setDeliveryStage("completed");

    Alert.alert(
      "Delivery Completed! 🎉",
      `You've successfully earned ${order.estimatedEarnings} for this dispatch run.`,
      [{ text: "Back to Dashboard", onPress: onBack }]
    );
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* MAPBOX BACKGROUND */}
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
                zoomLevel: 14.5,
              }}
            />
            <Mapbox.PointAnnotation id="rider-marker" coordinate={[3.3792, 6.5244]}>
              <View className="w-9 h-9 rounded-full bg-[#E11D48] border-2 border-white items-center justify-center shadow-xl">
                <Ionicons name="bicycle" size={18} color="#FFFFFF" />
              </View>
            </Mapbox.PointAnnotation>
          </Mapbox.MapView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-slate-500 text-xs">Mapbox Token Missing</Text>
          </View>
        )}
      </View>

      {/* TOP HEADER */}
      <View
        className="absolute left-4 right-4 z-20 bg-[#090D16]/95 border border-slate-800 px-4 py-3 rounded-2xl flex-row items-center justify-between shadow-2xl backdrop-blur-md"
        style={{ top: insets.top + 8 }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-1 mx-3 items-center">
          <Text className="text-white text-xs font-black uppercase tracking-wider">
            {deliveryStage === "to_pickup" ? "Heading to Pickup" : "Heading to Drop-off"}
          </Text>
          <Text className="text-slate-400 text-[10px]">
            Order #{order.id} • {order.distance}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCancelOrder}
          className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/30 items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={16} color="#FB7185" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM ACTIVE ORDER SHEET */}
      <ScrollView
        className="absolute bottom-0 left-0 right-0 bg-[#090D16] rounded-t-[32px] border-t border-slate-800 px-5 pt-4 z-20 max-h-[65%]"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 30) }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-12 h-1.5 rounded-full bg-slate-700 self-center mb-4" />

        {/* EARNINGS & STATUS */}
        <View className="flex-row items-center justify-between bg-[#111B2A] border border-slate-800 p-4 rounded-2xl mb-4">
          <View>
            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Payout</Text>
            <Text className="text-emerald-400 text-xl font-black mt-0.5">{order.estimatedEarnings}</Text>
          </View>
          <View className="items-end">
            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Package</Text>
            <Text className="text-white text-xs font-bold mt-0.5" numberOfLines={1}>{order.packageType}</Text>
          </View>
        </View>

        {/* CUSTOMER CONTACT & ACTIONS */}
        <View className="flex-row items-center justify-between bg-[#111B2A] border border-slate-800 p-4 rounded-2xl mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
              <Ionicons name="person" size={20} color="#E11D48" />
            </View>
            <View>
              <Text className="text-white text-sm font-extrabold">{order.customerName}</Text>
              <Text className="text-slate-400 text-[10px]">{order.customerPhone}</Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="w-10 h-10 rounded-xl bg-emerald-500 items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setChatModalVisible(true)}
              className="w-10 h-10 rounded-xl bg-sky-500 items-center justify-center shadow-lg relative"
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
              <View className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ROUTE STEPS & EXTERNAL MAPS BUTTON */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className={`w-3 h-3 rounded-full ${deliveryStage === "to_pickup" ? "bg-emerald-500 animate-pulse" : "bg-slate-600"} mr-3`} />
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold">Pickup Location</Text>
              <Text className="text-white text-xs font-bold" numberOfLines={1}>{order.pickup}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className={`w-3 h-3 rounded-full ${deliveryStage === "to_dropoff" ? "bg-[#E11D48] animate-pulse" : "bg-slate-600"} mr-3`} />
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold">Drop-off Location</Text>
              <Text className="text-white text-xs font-bold" numberOfLines={1}>{order.dropoff}</Text>
            </View>
          </View>

          {/* EXTERNAL MAPS LAUNCHER */}
          <TouchableOpacity
            onPress={handleOpenExternalMaps}
            className="bg-[#090D16] border border-slate-800 py-3 rounded-xl flex-row items-center justify-center gap-2"
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={16} color="#38BDF8" />
            <Text className="text-sky-400 text-xs font-bold">Open Google Maps / Navigation App</Text>
          </TouchableOpacity>
        </View>

        {/* PRIMARY STAGE ACTION */}
        {deliveryStage === "to_pickup" ? (
          <TouchableOpacity
            onPress={() => setDeliveryStage("to_dropoff")}
            className="bg-[#E11D48] py-4 rounded-2xl items-center shadow-lg mb-3"
            activeOpacity={0.85}
          >
            <Text className="text-white font-black text-sm">Confirm Package Picked Up</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setPinModalVisible(true)}
            className="bg-emerald-500 py-4 rounded-2xl items-center shadow-lg mb-3"
            activeOpacity={0.85}
          >
            <Text className="text-slate-950 font-black text-sm">Verify PIN & Complete Delivery</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* 4-DIGIT PIN VERIFICATION MODAL */}
      <Modal visible={pinModalVisible} animationType="slide" transparent onRequestClose={() => setPinModalVisible(false)}>
        <View className="flex-1 bg-[#030712CC] justify-end">
          <View className="bg-[#090D16] rounded-t-[32px] border-t border-slate-800 p-5 shadow-2xl" style={{ paddingBottom: Math.max(insets.bottom + 10, 20) }}>
            <View className="w-12 h-1.5 rounded-full bg-slate-700 self-center mb-4" />
            
            <Text className="text-white text-lg font-black mb-1">Enter Customer Delivery PIN</Text>
            <Text className="text-slate-400 text-xs mb-4">Ask the customer for their 4-digit confirmation PIN to finish drop-off.</Text>

            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4 items-center">
              <TextInput
                value={enteredPin}
                onChangeText={setEnteredPin}
                keyboardType="numeric"
                maxLength={4}
                placeholder="• • • •"
                placeholderTextColor="#64748B"
                className="text-white text-3xl font-black tracking-widest text-center w-full"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setPinModalVisible(false)}
                className="flex-1 bg-slate-900 border border-slate-800 py-3.5 rounded-2xl items-center"
              >
                <Text className="text-slate-400 font-bold text-xs">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVerifyPin}
                className="flex-1 bg-emerald-500 py-3.5 rounded-2xl items-center shadow-lg"
              >
                <Text className="text-slate-950 font-black text-xs">Verify & Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IN-APP CHAT MODAL */}
      <Modal visible={chatModalVisible} animationType="slide" transparent onRequestClose={() => setChatModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-[#030712CC] justify-end">
          <View className="bg-[#090D16] rounded-t-[32px] border-t border-slate-800 p-5 h-[70%] shadow-2xl flex flex-col">
            <View className="w-12 h-1.5 rounded-full bg-slate-700 self-center mb-4" />

            <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/30 items-center justify-center">
                  <Ionicons name="chatbubble" size={16} color="#38BDF8" />
                </View>
                <View>
                  <Text className="text-white text-sm font-black">{order.customerName}</Text>
                  <Text className="text-emerald-400 text-[10px]">Active Customer</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* MESSAGES LIST */}
            <ScrollView className="flex-1 mb-3" showsVerticalScrollIndicator={false}>
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  className={`mb-3 max-w-[80%] p-3.5 rounded-2xl ${
                    msg.sender === "rider"
                      ? "bg-[#E11D48] self-end rounded-br-none"
                      : "bg-[#111B2A] border border-slate-800 self-start rounded-bl-none"
                  }`}
                >
                  <Text className="text-white text-xs">{msg.text}</Text>
                  <Text className={`text-[9px] mt-1 text-right ${msg.sender === "rider" ? "text-rose-200" : "text-slate-400"}`}>
                    {msg.time}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* INPUT ROW */}
            <View className="flex-row items-center gap-2 pt-2 border-t border-slate-800">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message to customer..."
                placeholderTextColor="#64748B"
                className="flex-1 bg-[#111B2A] border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl"
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                className="w-11 h-11 bg-[#E11D48] rounded-2xl items-center justify-center shadow-lg"
                activeOpacity={0.85}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}