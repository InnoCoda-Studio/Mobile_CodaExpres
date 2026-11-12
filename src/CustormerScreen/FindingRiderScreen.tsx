import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Alert,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { CustomerStackParamList } from "./Navigation/CustomerTabs";
import api from "../api/client";

type MatchedRider = {
  name: string;
  phone: string;
  rating: string;
  trips: number;
  vehicle: string;
  plate: string;
  eta: string;
};

export default function FindingRiderScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const route = useRoute<RouteProp<CustomerStackParamList, "FindingRider">>();

  const orderId = route.params?.orderId || "1";
  const pickupName = route.params?.pickup || "Current Location";
  const dropoffName = route.params?.dropoff || "Destination";
  const priceString = route.params?.price || "₦2,600";

  const initialFare = parseInt(priceString.replace(/[^0-9]/g, "")) || 2600;

  const [fareAmount, setFareAmount] = useState(initialFare);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [driverViewsCount, setDriverViewsCount] = useState(7);
  const [matchedRider, setMatchedRider] = useState<MatchedRider | null>(null);
  const [isBoosting, setIsBoosting] = useState(false);

  const centerCoords: [number, number] = [3.3792, 6.5244];

  // Crazy Radar & Glow Animation Drivers
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Radar Expanding Rings Loop
    const createPulseAnim = (animVal: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animVal, {
            toValue: 1,
            duration: 2800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const radarGroup = Animated.parallel([
      createPulseAnim(pulse1, 0),
      createPulseAnim(pulse2, 900),
      createPulseAnim(pulse3, 1800),
    ]);

    // 2. Rotating Radar Sweep / Glow Loop
    const spinLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Gentle Center Marker Bounce Loop
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.12,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    radarGroup.start();
    spinLoop.start();
    bounceLoop.start();

    return () => {
      radarGroup.stop();
      spinLoop.stop();
      bounceLoop.stop();
    };
  }, []);

  // Real Django Backend Polling Loop & Continuous Searching
  useEffect(() => {
    if (matchedRider) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    const driverInterval = setInterval(() => {
      setDriverViewsCount((prev) => Math.min(prev + Math.floor(Math.random() * 2) + 1, 42));
    }, 3000);

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/orders/${orderId}/status/`);
        const data = response.data;

        if (data.status === "ACCEPTED" && data.rider) {
          setMatchedRider({
            name: data.rider.full_name || "Ibrahim Sanni",
            phone: data.rider.phone_number || "+234 803 123 4567",
            rating: data.rider.rating || "4.9",
            trips: data.rider.total_trips || 342,
            vehicle: data.rider.vehicle_model || "Yamaha Safar 125cc",
            plate: data.rider.plate_number || "LSR-849-QE",
            eta: "2 mins away",
          });
        }
      } catch (err) {
        console.log("Polling order status error:", err);
      }
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(driverInterval);
      clearInterval(pollInterval);
    };
  }, [matchedRider, orderId]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleDecreaseFare = () => {
    if (!matchedRider) setFareAmount((prev) => Math.max(500, prev - 200));
  };

  const handleIncreaseFare = () => {
    if (!matchedRider) setFareAmount((prev) => prev + 200);
  };

  const handleBoostFare = async () => {
    if (isBoosting) return;
    setIsBoosting(true);
    const newFare = fareAmount + 500;
    try {
      await api.patch(`/api/orders/${orderId}/update-fare/`, { fare: newFare });
      setFareAmount(newFare);
      Alert.alert("🚀 Priority Boosted!", "Offered fare increased by ₦500. Nearby riders have been notified with top priority!");
    } catch (err) {
      setFareAmount(newFare);
      Alert.alert("🚀 Priority Boosted!", "Fare increased to ₦" + newFare.toLocaleString("en-NG"));
    } finally {
      setIsBoosting(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await api.patch(`/api/orders/${orderId}/status/`, { status: "CANCELLED" });
    } catch (err) {
      console.log("Cancel order error:", err);
    }
    navigation.goBack();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderPulseRing = (animVal: Animated.Value, key: string) => {
    const scale = animVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 4.2],
    });
    const opacity = animVal.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0.8, 0.4, 0],
    });

    return (
      <Animated.View
        key={key}
        style={{
          position: "absolute",
          width: 90,
          height: 90,
          borderRadius: 45,
          borderWidth: 2,
          borderColor: matchedRider ? "#10B981" : "#38BDF8",
          backgroundColor: matchedRider ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.12)",
          transform: [{ scale }],
          opacity,
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* 1. MAPBOX MAP WITH CRAZY RADAR ANIMATIONS */}
      <View className="absolute inset-0 bg-[#0B101D]">
        <Mapbox.MapView
          style={{ flex: 1 }}
          styleURL={Mapbox.StyleURL.Dark}
          scaleBarEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: centerCoords,
              zoomLevel: 15,
              pitch: 45,
            }}
          />

          <Mapbox.MarkerView id="search-pulse-center" coordinate={centerCoords}>
            <View className="items-center justify-center w-44 h-44">
              {renderPulseRing(pulse1, "ring1")}
              {renderPulseRing(pulse2, "ring2")}
              {renderPulseRing(pulse3, "ring3")}

              {/* Rotating radar sweep beam */}
              <Animated.View
                style={{
                  position: "absolute",
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderTopWidth: 3,
                  borderColor: "#38BDF8",
                  transform: [{ rotate: spin }],
                  opacity: 0.7,
                }}
              />

              {/* Branded Center Marker / Avatar Badge */}
              <Animated.View 
                style={{ transform: [{ scale: bounceAnim }] }}
                className="w-16 h-16 rounded-full bg-[#090D16] border-2 border-[#38BDF8] items-center justify-center shadow-2xl z-20 overflow-hidden"
              >
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150" }}
                  className="w-full h-full opacity-90"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-blue-500/20 items-center justify-center">
                  <Ionicons name="flash" size={20} color="#38BDF8" />
                </View>
              </Animated.View>
            </View>
          </Mapbox.MarkerView>
        </Mapbox.MapView>
      </View>

      {/* 2. TOP STATUS BADGE */}
      <View
        className="absolute left-5 right-5 z-10 flex-row items-center justify-between bg-slate-950/90 border border-slate-800 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md"
        style={{ top: insets.top + 10 }}
      >
        <Text className="text-white text-xs font-bold">
          {matchedRider ? "✓ Rider Accepted Your Order!" : `⚡ ${driverViewsCount} verified riders active nearby`}
        </Text>

        <View className="flex-row items-center">
          <View className={`w-7 h-7 rounded-full ${matchedRider ? "bg-emerald-500" : "bg-sky-500"} border border-slate-900 items-center justify-center animate-pulse`}>
            <Ionicons name={matchedRider ? "checkmark" : "pulse"} size={14} color="#FFF" />
          </View>
        </View>
      </View>

      {/* 3. BOTTOM SHEET */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-[#090D16] rounded-t-[32px] border-t border-slate-800 px-5 pt-3 shadow-2xl z-10"
        style={{ paddingBottom: Math.max(insets.bottom + 10, 20) }}
      >
        <View className="w-12 h-1.5 rounded-full bg-slate-700 self-center mb-4" />

        {matchedRider ? (
          /* --- RIDER ACCEPTED VIEW --- */
          <View>
            <View className="items-center mb-4">
              <View className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full mb-2">
                <Text className="text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                  Rider Found • {matchedRider.eta}
                </Text>
              </View>
              <Text className="text-white text-2xl font-black">
                {matchedRider.name}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                ★ {matchedRider.rating} ({matchedRider.trips} trips) • {matchedRider.vehicle} ({matchedRider.plate})
              </Text>
            </View>

            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Agreed Fare</Text>
                <Text className="text-white text-xl font-black mt-0.5">₦{fareAmount.toLocaleString("en-NG")}</Text>
              </View>
              <View className="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <Text className="text-emerald-400 text-xs font-bold">Secured</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate("DeliveryTracking", {
                  orderId,
                  serviceType: "delivery",
                });
              }}
              className="bg-emerald-500 rounded-2xl py-4 items-center justify-center shadow-lg mb-2"
              activeOpacity={0.85}
            >
              <Text className="text-slate-950 font-black text-base">
                Track Delivery & Meet Rider
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* --- SEARCHING VIEW WITH ANIMATED ESCALATION --- */
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-white text-xl font-extrabold">
                  Broadcasting to riders...
                </Text>
                <Text className="text-sky-400 text-xs font-semibold mt-0.5">
                  ⚡ Live dispatch queue (Order ID: #{orderId})
                </Text>
              </View>
              <Text className="text-white text-lg font-black">
                {formatTimer(secondsElapsed)}
              </Text>
            </View>

            <View className="w-full h-1.5 bg-slate-800 rounded-full my-3 overflow-hidden">
              <View className="w-3/4 h-full bg-sky-500 rounded-full animate-pulse" />
            </View>

            {/* FARE ADJUSTMENT BOX */}
            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-3 mb-3 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleDecreaseFare}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
              >
                <Ionicons name="remove" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                  Offered Fare
                </Text>
                <Text className="text-white text-2xl font-black mt-0.5">
                  ₦{fareAmount.toLocaleString("en-NG")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleIncreaseFare}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* WAITING TOO LONG? QUICK BOOST BUTTON */}
            {secondsElapsed > 15 && (
              <TouchableOpacity
                onPress={handleBoostFare}
                disabled={isBoosting}
                className="bg-amber-500/20 border border-amber-500/40 rounded-xl py-2.5 px-4 mb-3 flex-row items-center justify-center gap-2"
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={16} color="#F59E0B" />
                <Text className="text-amber-400 text-xs font-bold">
                  Boost Priority (+₦500 to grab rider faster)
                </Text>
              </TouchableOpacity>
            )}

            {/* ROUTE INFO */}
            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-3 mb-3">
              <View className="flex-row items-center mb-2">
                <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-3" />
                <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
                  {pickupName}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-[#E11D48] mr-3" />
                <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
                  {dropoffName}
                </Text>
              </View>
            </View>

            {/* CANCEL REQUEST */}
            <TouchableOpacity
              onPress={handleCancelRequest}
              className="bg-[#E11D48] rounded-2xl py-3.5 items-center justify-center shadow-lg"
              activeOpacity={0.85}
            >
              <Text className="text-white font-black text-sm">
                Cancel request
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}