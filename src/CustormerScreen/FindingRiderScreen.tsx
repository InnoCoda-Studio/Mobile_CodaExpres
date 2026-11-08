import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RideOption } from "./RideOptionsScreen";
import type { Place } from "./RouteSearchScreen";

export type DeliveryRoute = {
  pickup: Place;
  dropoff: Place;
};

type Props = {
  route: DeliveryRoute;
  vehicle: RideOption;
  onBack: () => void;
  onEditLocations: () => void;
  onConfirm: () => void | Promise<void>;
};

type Coordinates = [number, number];

type RouteGeometry = {
  type: "LineString";
  coordinates: Coordinates[];
};

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

const isValidCoordinates = (
  value: unknown
): value is Coordinates => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(
      (n) =>
        typeof n === "number" &&
        Number.isFinite(n)
    ) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
  );
};

export default function DeliveryReviewScreen({
  route,
  vehicle,
  onBack,
  onEditLocations,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();

  const cameraRef = useRef<Mapbox.Camera>(null);
  const confirmationLocked = useRef(false);
  const mounted = useRef(true);

  const [busy, setBusy] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [_routeError, setRouteError] = useState<string | null>(null);

  const [routeGeometry, setRouteGeometry] =
    useState<RouteGeometry | null>(null);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);

  const pickup = route.pickup.coordinates;
  const dropoff = route.dropoff.coordinates;

  const validPickup = isValidCoordinates(pickup);
  const validDropoff = isValidCoordinates(dropoff);
  const good = validPickup && validDropoff;

  const center = useMemo<Coordinates>(() => {
    if (validPickup && validDropoff) {
      return [
        (pickup[0] + dropoff[0]) / 2,
        (pickup[1] + dropoff[1]) / 2,
      ];
    }
    if (validPickup) return pickup;
    if (validDropoff) return dropoff;
    return [3.3792, 6.5244];
  }, [validPickup, validDropoff, pickup, dropoff]);

  const bounds = useMemo(() => {
    if (!good) return undefined;

    return {
      ne: [
        Math.max(pickup[0], dropoff[0]),
        Math.max(pickup[1], dropoff[1]),
      ] as Coordinates,
      sw: [
        Math.min(pickup[0], dropoff[0]),
        Math.min(pickup[1], dropoff[1]),
      ] as Coordinates,
      paddingTop: 120,
      paddingBottom: 240,
      paddingLeft: 60,
      paddingRight: 60,
    };
  }, [good, pickup, dropoff]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // FETCH REAL DRIVING ROUTE
  useEffect(() => {
    if (!good || !MAPBOX_TOKEN) {
      setRouteGeometry(null);
      setDistanceKm(null);
      setDurationMin(null);
      setRouteLoading(false);
      setRouteError(
        !MAPBOX_TOKEN
          ? "Mapbox access token is missing."
          : "Invalid pickup or drop-off location."
      );
      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      setRouteLoading(true);
      setRouteError(null);

      try {
        const coordinates = `${pickup[0]},${pickup[1]};${dropoff[0]},${dropoff[1]}`;
        const url =
          "https://api.mapbox.com/directions/v5/mapbox/driving/" +
          coordinates +
          "?geometries=geojson&overview=full&access_token=" +
          encodeURIComponent(MAPBOX_TOKEN);

        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        if (!response.ok || data.code !== "Ok" || !data.routes?.length) {
          throw new Error(data.message || "No driving route found.");
        }

        const bestRoute = data.routes[0];
        if (controller.signal.aborted) return;

        setRouteGeometry(bestRoute.geometry);
        setDistanceKm(bestRoute.distance / 1000);
        setDurationMin(bestRoute.duration / 60);
      } catch (error: any) {
        if (controller.signal.aborted) return;
        setRouteError(error?.message || "Unable to calculate route.");
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    fetchRoute();
    return () => controller.abort();
  }, [good, pickup, dropoff]);

  const handleConfirm = async () => {
    if (!good || busy || confirmationLocked.current) return;

    confirmationLocked.current = true;
    setBusy(true);

    try {
      await onConfirm();
    } catch (_error) {
      Alert.alert(
        "Booking failed",
        "Unable to confirm your delivery. Please try again."
      );
    } finally {
      confirmationLocked.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const handleRecenter = () => {
    if (!cameraRef.current) return;
    if (bounds) {
      cameraRef.current.fitBounds(
        bounds.ne,
        bounds.sw,
        [120, 60, 240, 60],
        600
      );
    } else {
      cameraRef.current.setCamera({
        centerCoordinate: center,
        zoomLevel: 13,
        animationDuration: 600,
      });
    }
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* 1. MAPBOX MAP FILLING ENTIRE BACKGROUND */}
      <View className="absolute inset-0 bg-[#0B101D]">
        {good ? (
          <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Dark}
            scaleBarEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <Mapbox.Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate: center,
                zoomLevel: 13,
              }}
              bounds={bounds}
            />

            {/* ROUTE LINE */}
            {routeGeometry && (
              <Mapbox.ShapeSource
                id="review-driving-route"
                shape={{
                  type: "Feature",
                  properties: {},
                  geometry: routeGeometry,
                }}
              >
                <Mapbox.LineLayer
                  id="review-route-outline"
                  style={{
                    lineColor: "#10B981",
                    lineWidth: 6,
                    lineOpacity: 0.9,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </Mapbox.ShapeSource>
            )}

            {/* PICKUP MARKER */}
            {validPickup && (
              <Mapbox.MarkerView id="review-pickup" coordinate={pickup}>
                <View className="w-7 h-7 rounded-full bg-[#10B981] border-2 border-white items-center justify-center">
                  <Ionicons name="radio-button-on" size={14} color="#FFF" />
                </View>
              </Mapbox.MarkerView>
            )}

            {/* DROPOFF MARKER */}
            {validDropoff && (
              <Mapbox.MarkerView id="review-dropoff" coordinate={dropoff}>
                <View className="w-7 h-7 rounded-full bg-[#E11D48] border-2 border-white items-center justify-center">
                  <Ionicons name="location" size={16} color="#FFF" />
                </View>
              </Mapbox.MarkerView>
            )}
          </Mapbox.MapView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#64748B] text-xs">
              Select valid locations to preview map
            </Text>
          </View>
        )}
      </View>

      {/* 2. FLOATING HEADER CONTROLS */}
      <View 
        className="absolute left-4 right-4 flex-row items-center justify-between z-10"
        style={{ top: insets.top + 10 }}
      >
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-slate-800 items-center justify-center shadow-lg" 
          onPress={onBack} 
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-row items-center bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-full gap-2 shadow-lg">
          <Ionicons name="navigate" size={15} color="#10B981" />
          <Text className="text-white text-xs font-bold">
            {routeLoading
              ? "Calculating route..."
              : distanceKm !== null && durationMin !== null
              ? `${distanceKm.toFixed(1)} km • ${Math.ceil(durationMin)} mins`
              : "Review Route"}
          </Text>
        </View>

        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-slate-800 items-center justify-center shadow-lg" 
          onPress={handleRecenter} 
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 3. COMPACT FLOATING REVIEW SHEET */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-[#090D16] rounded-t-[28px] border-t border-slate-800 px-4 pt-2.5 shadow-2xl z-10"
        style={{ paddingBottom: Math.max(insets.bottom + 10, 16) }}
      >
        <View className="w-9 h-1 rounded-full bg-slate-700 self-center mb-3" />

        {/* ROUTE COMPACT SUMMARY */}
        <View className="bg-[#0F172A] rounded-2xl border border-slate-800 p-3 mb-3">
          <View className="flex-row items-center gap-2.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
              {route.pickup.name || route.pickup.address}
            </Text>
          </View>

          <View className="w-0.5 h-2.5 bg-slate-700 ml-1 my-0.5" />

          <View className="flex-row items-center gap-2.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
            <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
              {route.dropoff.name || route.dropoff.address}
            </Text>
          </View>
        </View>

        {/* VEHICLE + CONFIRM ROW */}
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity 
            onPress={onEditLocations} 
            className="flex-1 flex-row items-center bg-[#0F172A] border border-slate-800 px-3 py-2.5 rounded-2xl" 
            activeOpacity={0.8}
          >
            <Ionicons name="bicycle" size={20} color="#E11D48" />
            <View className="ml-2 flex-1">
              <Text className="text-white text-xs font-bold" numberOfLines={1}>
                {vehicle.name}
              </Text>
              <Text className="text-[#10B981] text-xs font-extrabold">
                {vehicle.price}
              </Text>
            </View>
            <Ionicons name="pencil" size={14} color="#64748B" className="ml-1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!good || busy}
            activeOpacity={0.85}
            className={`flex-row items-center bg-[#E11D48] px-5 py-3.5 rounded-2xl gap-2 ${
              (!good || busy) ? "opacity-50" : ""
            }`}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text className="text-white text-sm font-extrabold">Confirm</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}