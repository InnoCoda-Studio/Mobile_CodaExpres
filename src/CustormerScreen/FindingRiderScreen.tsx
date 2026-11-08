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

  const orderId = route.params?.orderId || "DEMO-CDX-001";
  const pickupName = route.params?.pickup || "Current Location";
  const dropoffName = route.params?.dropoff || "Destination";
  const priceString = route.params?.price || "₦2,600";

  const initialFare = parseInt(priceString.replace(/[^0-9]/g, "")) || 2600;

  const [fareAmount, setFareAmount] = useState(initialFare);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [driverViewsCount, setDriverViewsCount] = useState(5);
  const [matchedRider, setMatchedRider] = useState<MatchedRider | null>(null);

  const centerCoords: [number, number] = [3.3792, 6.5244];

  // Radar Animation Rings
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseAnim = (animVal: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animVal, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animGroup = Animated.parallel([
      createPulseAnim(pulse1, 0),
      createPulseAnim(pulse2, 800),
      createPulseAnim(pulse3, 1600),
    ]);

    animGroup.start();
    return () => animGroup.stop();
  }, []);

  // Timer & Automatic Rider Acceptance Simulation
  useEffect(() => {
    if (matchedRider) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    const driverInterval = setInterval(() => {
      setDriverViewsCount((prev) => Math.min(prev + Math.floor(Math.random() * 2) + 1, 24));
    }, 3000);

    // Automatically match a rider after 8 seconds of searching
    const matchTimeout = setTimeout(() => {
      setMatchedRider({
        name: "Ibrahim Sanni",
        phone: "+234 803 123 4567",
        rating: "4.9",
        trips: 342,
        vehicle: "Yamaha Safar 125cc",
        plate: "LSR-849-QE",
        eta: "2 mins away",
      });
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(driverInterval);
      clearTimeout(matchTimeout);
    };
  }, [matchedRider]);

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

  const handleCancelRequest = () => {
    navigation.goBack();
  };

  const renderPulseRing = (animVal: Animated.Value, key: string) => {
    const scale = animVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 3.8],
    });
    const opacity = animVal.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.7, 0.35, 0],
    });

    return (
      <Animated.View
        key={key}
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: matchedRider ? "#10B981" : "#E11D48",
          transform: [{ scale }],
          opacity,
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* 1. MAPBOX MAP WITH RADAR */}
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
              zoomLevel: 14.5,
              pitch: 30,
            }}
          />

          <Mapbox.MarkerView id="search-pulse-center" coordinate={centerCoords}>
            <View className="items-center justify-center w-36 h-36">
              {renderPulseRing(pulse1, "ring1")}
              {renderPulseRing(pulse2, "ring2")}
              {renderPulseRing(pulse3, "ring3")}

              <View className={`w-12 h-12 rounded-full bg-[#090D16] border-2 ${matchedRider ? "border-emerald-500" : "border-[#E11D48]"} items-center justify-center shadow-2xl z-20`}>
                <Ionicons 
                  name={matchedRider ? "bicycle" : "location"} 
                  size={22} 
                  color={matchedRider ? "#10B981" : "#E11D48"} 
                />
              </View>
            </View>
          </Mapbox.MarkerView>
        </Mapbox.MapView>
      </View>

      {/* 2. TOP STATUS BADGE */}
      <View
        className="absolute left-5 right-5 z-10 flex-row items-center justify-between bg-slate-950/85 border border-slate-800 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md"
        style={{ top: insets.top + 10 }}
      >
        <Text className="text-white text-xs font-bold">
          {matchedRider ? "✓ Rider Accepted Your Order!" : `${driverViewsCount} riders viewing your request`}
        </Text>

        <View className="flex-row items-center">
          <View className={`w-7 h-7 rounded-full ${matchedRider ? "bg-emerald-500" : "bg-rose-500"} border border-slate-900 items-center justify-center`}>
            <Ionicons name={matchedRider ? "checkmark" : "person"} size={14} color="#FFF" />
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

            {/* Fare Locked Box */}
            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Agreed Fare</Text>
                <Text className="text-white text-xl font-black mt-0.5">₦{fareAmount.toLocaleString("en-NG")}</Text>
              </View>
              <View className="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <Text className="text-emerald-400 text-xs font-bold">Secured</Text>
              </View>
            </View>

            {/* Track Order Button */}
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
          /* --- SEARCHING VIEW --- */
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-white text-xl font-extrabold">
                  Searching for riders...
                </Text>
                <Text className="text-emerald-400 text-xs font-semibold mt-0.5">
                  ✓ Verified drivers only (Order: {orderId})
                </Text>
              </View>
              <Text className="text-white text-lg font-black">
                {formatTimer(secondsElapsed)}
              </Text>
            </View>

            <View className="w-full h-1 bg-slate-800 rounded-full my-3 overflow-hidden">
              <View className="w-2/3 h-full bg-[#E11D48] rounded-full animate-pulse" />
            </View>

            {/* FARE ADJUSTMENT BOX */}
            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-3 mb-4 flex-row items-center justify-between">
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

            {/* ROUTE INFO */}
            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-3 h-3 rounded-full bg-emerald-500 mr-3" />
                <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
                  {pickupName}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#E11D48] mr-3" />
                <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
                  {dropoffName}
                </Text>
              </View>
            </View>

            {/* CANCEL REQUEST */}
            <TouchableOpacity
              onPress={handleCancelRequest}
              className="bg-[#E11D48] rounded-2xl py-4 items-center justify-center shadow-lg mb-2"
              activeOpacity={0.85}
            >
              <Text className="text-white font-black text-base">
                Cancel request
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}