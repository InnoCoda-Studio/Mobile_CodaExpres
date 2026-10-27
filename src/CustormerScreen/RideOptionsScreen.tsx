import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import Mapbox from '@rnmapbox/maps';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Place } from "./RouteSearchScreen";

export type RideOption = {
  id: string;
  name: string;
  category: string;
  eta: string;
  price: string;
  badge?: string;
  image: any;
};

const PICKUP_PREPARATION_MIN = 5;

const VEHICLE_SPEED_FACTOR: Record<string, number> = {
  "1": 0.85, // Motorbike
  "2": 1.5,  // Bicycle
  "3": 1,    // Car / Van
};

const getMinutes = (value: string): number => {
  const minutes = Number.parseInt(value, 10);
  return Number.isFinite(minutes) ? minutes : 0;
};

interface RideOptionsProps {
  route: {
    pickup: Place;
    dropoff: Place;
  };
  onBack: () => void;
  onConfirm: (option: RideOption) => void;
}

const RIDE_OPTIONS: RideOption[] = [
  {
    id: "1",
    name: "Motorbike Express",
    category: "Fast delivery • 1-2 parcels",
    eta: "10 min",
    price: "₦2,500",
    badge: "FASTER",
    image: require("../../assets/bike-man-on-rider.png"),
  },
  {
    id: "2",
    name: "Bicycle Courier",
    category: "Eco-friendly • Small items",
    eta: "25 min",
    price: "₦1,500",
    image: require("../../assets/bisycle_move.png"),
  },
  {
    id: "3",
    name: "Coda Van / Car",
    category: "Large packages • Bulk cargo",
    eta: "15 min",
    price: "₦6,500",
    badge: "HEAVY DUTY",
    image: require("../../assets/car.png"),
  },
];

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiaW5ub2NvZGEiLCJhIjoiY212ZjE3NXBnMDBndTJ5cjI2bnkzejg1eiJ9.qbPEK--lMHUSft-0yMqRsg';

export default function RideOptionsScreen({
  route,
  onBack,
  onConfirm,
}: RideOptionsProps) {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string>("1");
  const [paymentMethod] = useState<string>("Cash");

  const selectedOption = RIDE_OPTIONS.find((opt) => opt.id === selectedId) ?? RIDE_OPTIONS[0];

  const pickupCoords = route.pickup.coordinates;
  const dropoffCoords = route.dropoff.coordinates;

  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const hasValidCoordinates =
    Array.isArray(pickupCoords) &&
    pickupCoords.length === 2 &&
    pickupCoords.every(Number.isFinite) &&
    Array.isArray(dropoffCoords) &&
    dropoffCoords.length === 2 &&
    dropoffCoords.every(Number.isFinite);

  const centerCoords = useMemo<[number, number]>(() => {
    if (hasValidCoordinates) {
      return [
        (pickupCoords![0] + dropoffCoords![0]) / 2,
        (pickupCoords![1] + dropoffCoords![1]) / 2,
      ];
    }
    return [3.3792, 6.5244];
  }, [hasValidCoordinates, pickupCoords, dropoffCoords]);

  const confirmationLocked = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const canConfirm =
    !routeLoading &&
    !routeError &&
    hasValidCoordinates &&
    !!routeGeometry &&
    !!selectedOption &&
    !isConfirming;

  const handleVehicleConfirm = () => {
    if (!canConfirm || confirmationLocked.current) return;

    confirmationLocked.current = true;
    setIsConfirming(true);

    try {
      onConfirm(selectedOption);
    } catch (error) {
      console.error("Vehicle confirmation failed:", error);
      confirmationLocked.current = false;
      setIsConfirming(false);
    }
  };

  const [estimateBaseTime] = useState(() => Date.now());

  const pickupEtaMin = getMinutes(selectedOption.eta);

  const travelEtaMin =
    durationMin !== null
      ? Math.max(
          1,
          Math.ceil(
            durationMin *
            (VEHICLE_SPEED_FACTOR[selectedOption.id] ?? 1)
          )
        )
      : null;

  const deliveryEtaMin =
    travelEtaMin !== null
      ? pickupEtaMin + PICKUP_PREPARATION_MIN + travelEtaMin
      : null;

  const pickupArrivalTime = new Date(
    estimateBaseTime + pickupEtaMin * 60_000
  ).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const deliveryArrivalTime =
    deliveryEtaMin !== null
      ? new Date(
          estimateBaseTime + deliveryEtaMin * 60_000
        ).toLocaleTimeString("en-NG", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : null;

  useEffect(() => {
    if (!hasValidCoordinates || !MAPBOX_TOKEN) {
      setRouteError("Select valid pickup and dropoff locations.");
      setRouteLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchDrivingRoute = async () => {
      setRouteLoading(true);
      setRouteError(null);

      try {
        const coordinates =
          `${pickupCoords![0]},${pickupCoords![1]};` +
          `${dropoffCoords![0]},${dropoffCoords![1]}`;

        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}` +
          `?geometries=geojson&overview=full&access_token=${encodeURIComponent(MAPBOX_TOKEN)}`;

        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        if (!response.ok || data.code !== "Ok" || !data.routes?.length) {
          throw new Error(data.message || "No driving route found.");
        }

        const bestRoute = data.routes[0];
        setRouteGeometry(bestRoute.geometry);
        setDistanceKm(bestRoute.distance / 1000);
        setDurationMin(bestRoute.duration / 60);
      } catch (error: any) {
        if (!controller.signal.aborted) {
          console.error("Mapbox directions error:", error);
          setRouteError(error.message || "Unable to calculate route.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    fetchDrivingRoute();
    return () => controller.abort();
  }, [hasValidCoordinates, pickupCoords, dropoffCoords]);

  return (
    <View style={{ flex: 1, backgroundColor: "#06090F", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* TOP ROUTE SUMMARY BAR */}
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-800/80 bg-[#06090F] z-10">
        <TouchableOpacity
          onPress={onBack}
          className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700/80 items-center justify-center shadow-md"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-1 mx-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl flex-row items-center justify-between shadow-inner">
          <View className="flex-1 mr-2">
            <Text className="text-white text-xs font-bold" numberOfLines={1}>
              {route.pickup.name} → {route.dropoff.name}
            </Text>
          </View>
        </View>
      </View>

      {/* LIVE MAPBOX MAP VIEW WITH ROUTE LINE */}
      <View className="flex-1 bg-slate-950 relative">
        <Mapbox.MapView
          style={{ flex: 1 }}
          styleURL={Mapbox.StyleURL.Dark}
          scaleBarEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <Mapbox.Camera
            centerCoordinate={centerCoords}
            zoomLevel={12}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {routeGeometry && (
            <Mapbox.ShapeSource
              id="realDrivingRoute"
              shape={{
                type: "Feature",
                properties: {},
                geometry: routeGeometry,
              }}
            >
              <Mapbox.LineLayer
                id="realDrivingRouteLine"
                style={{
                  lineColor: "#10B981",
                  lineWidth: 5,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </Mapbox.ShapeSource>
          )}

          {hasValidCoordinates && (
            <>
              <Mapbox.MarkerView id="pickupMarker" coordinate={pickupCoords!}>
                <View className="items-center">
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">Pickup</Text>
                  </View>
                  <View className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white mt-1" />
                </View>
              </Mapbox.MarkerView>

              {dropoffCoords && (
                <Mapbox.MarkerView id="dropoffMarker" coordinate={dropoffCoords!} anchor={{ x: 0.5, y: 0.5 }}>
                  <View className="items-center justify-center">
                    <Image
                      source={require("../../assets/location.png")}
                      style={{ width: 55, height: 55 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white text-[10px] font-bold mt-1 bg-[#090D16] px-2 py-1 rounded-lg" numberOfLines={1}>
                      {route.dropoff.name}
                    </Text>
                  </View>
                </Mapbox.MarkerView>
              )}
            </>
          )}
        </Mapbox.MapView>

        {/* FLOATING ETA BADGE */}
        <View className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl flex-row items-center shadow-xl">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5" />
          <Text className="text-slate-200 text-xs font-bold">
            {routeLoading
              ? "Calculating road route..."
              : routeError
              ? routeError
              : distanceKm !== null && durationMin !== null
              ? `${distanceKm.toFixed(1)} km • ${Math.ceil(durationMin)} min estimated driving`
              : "Route unavailable"}
          </Text>
        </View>
      </View>

      {/* BOTTOM VEHICLE TIER SHEET */}
      <View className="bg-[#090D16] border-t border-slate-800 rounded-t-[32px] px-5 pt-4 pb-5 shadow-2xl">
        <View style={{ width: 50, height: 4, borderRadius: 10, backgroundColor: "#475569", alignSelf: "center", marginBottom: 16 }} />

        {/* ESTIMATED TIMES */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-extrabold">Estimated delivery times</Text>
            <View className="bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <Text className="text-emerald-400 text-[10px] font-bold">ESTIMATED</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-[#111B2A] border border-emerald-500/20 rounded-2xl p-3">
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={16} color="#10B981" />
                <Text className="text-slate-400 text-xs ml-1.5">Rider pickup</Text>
              </View>
              <Text className="text-white text-xl font-black">{pickupEtaMin} min</Text>
              <Text className="text-emerald-400 text-xs mt-1 font-semibold">Around {pickupArrivalTime}</Text>
            </View>

            <View className="flex-1 bg-[#111B2A] border border-rose-500/20 rounded-2xl p-3">
              <View className="flex-row items-center mb-2">
                <Ionicons name="flag-outline" size={16} color="#E11D48" />
                <Text className="text-slate-400 text-xs ml-1.5">Package delivery</Text>
              </View>
              <Text className="text-white text-xl font-black">{deliveryEtaMin !== null ? `${deliveryEtaMin} min` : "--"}</Text>
              <Text className="text-rose-400 text-xs mt-1 font-semibold">{deliveryArrivalTime ? `Around ${deliveryArrivalTime}` : "Calculating..."}</Text>
            </View>
          </View>
        </View>

        {/* VEHICLE LIST */}
        <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
          {RIDE_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => {
                  if (!isConfirming) {
                    setSelectedId(option.id);
                  }
                }}
                activeOpacity={0.85}
                className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "bg-[#161D31] border-[#E11D48] shadow-lg shadow-rose-900/20"
                    : "bg-slate-900/80 border-slate-800"
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <Image source={option.image} style={{ width: 64, height: 48 }} resizeMode="contain" />
                  <View className="ml-4 flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white text-base font-extrabold">{option.name}</Text>
                      {option.badge && (
                        <View className="ml-2 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                          <Text className="text-emerald-400 text-[9px] font-black tracking-widest uppercase">
                            {option.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-slate-400 text-xs font-medium mt-0.5">
                      {option.eta} • {option.category}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-white text-lg font-black">{option.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* PAYMENT & CONFIRM BUTTON BAR */}
        <View className="pt-3 border-t border-slate-800/80 flex-row items-center justify-between mt-2">
          <TouchableOpacity className="bg-slate-900 border border-slate-800 px-4 py-3.5 rounded-2xl flex-row items-center mr-3" activeOpacity={0.8}>
            <Ionicons name="wallet-outline" size={18} color="#10B981" style={{ marginRight: 6 }} />
            <Text className="text-white font-bold text-sm">{paymentMethod}</Text>
            <Ionicons name="chevron-down" size={14} color="#94A3B8" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canConfirm}
            onPress={handleVehicleConfirm}
            activeOpacity={0.85}
            className={`flex-1 rounded-2xl py-4 flex-row items-center justify-center ${
              canConfirm ? "bg-[#E11D48]" : "bg-slate-700 opacity-60"
            }`}
          >
            <Text className="text-white font-black text-base">
              {isConfirming
                ? "Please wait..."
                : routeLoading
                ? "Calculating route..."
                : routeError
                ? "Route unavailable"
                : `Select ${selectedOption.name}`}
            </Text>

            {!isConfirming && canConfirm && (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}