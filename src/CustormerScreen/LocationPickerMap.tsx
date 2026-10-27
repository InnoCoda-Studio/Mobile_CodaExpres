import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

import * as Haptics from "expo-haptics";
import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Place } from "./RouteSearchScreen";

type Field = "pickup" | "dropoff";
type Coordinates = [number, number];

interface LocationPickerMapProps {
  mode: Field;
  initialCoordinates?: Coordinates;
  onBack: () => void;
  onConfirm: (place: Place) => void;
}

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiaW5ub2NvZGEiLCJhIjoiY212ZjE3NXBnMDBndTJ5cjI2bnkzejg1eiJ9.qbPEK--lMHUSft-0yMqRsg';

export default function LocationPickerMap({
  mode,
  initialCoordinates,
  onBack,
  onConfirm,
}: LocationPickerMapProps) {
  const insets = useSafeAreaInsets();

  const startingCoords: Coordinates =
    initialCoordinates ?? [3.3792, 6.5244];

  const [coords, setCoords] = useState<Coordinates>(startingCoords);
  const [address, setAddress] = useState("Finding address...");
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState(false);

  const [houseNumber, setHouseNumber] = useState<string | null>(null);
    const [streetName, setStreetName] = useState("");
    const [areaName, setAreaName] = useState("");

  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const isPickup = mode === "pickup";
  const color = isPickup ? "#10B981" : "#E11D48";

  // Reanimated shared values
  const pinTranslateY = useSharedValue(0);
  const pinScale = useSharedValue(1);
  const pinRotation = useSharedValue(0);

  const shadowScale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.3);

  const rippleScale = useSharedValue(0.2);
  const rippleOpacity = useSharedValue(0);

  const isDragging = useRef(false);

  const cameraRef = useRef<Mapbox.Camera>(null);
    const zoomRef = useRef(16);

  const pinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: pinTranslateY.value },
      { scale: pinScale.value },
      { rotate: `${pinRotation.value}deg` },
    ],
  }));

  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shadowScale.value }],
    opacity: shadowOpacity.value,
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  // Lift pin up when dragging starts
  const liftPin = () => {
    if (isDragging.current) return;
    isDragging.current = true;

    cancelAnimation(pinTranslateY);
    cancelAnimation(pinScale);
    cancelAnimation(pinRotation);

    pinTranslateY.value = withSpring(-28, {
      damping: 15,
      stiffness: 220,
    });

    pinScale.value = withSpring(1.18, {
      damping: 13,
      stiffness: 230,
    });

    pinRotation.value = withSequence(
      withTiming(-8, { duration: 90 }),
      withTiming(8, { duration: 150 }),
      withTiming(0, { duration: 120 })
    );

    shadowScale.value = withTiming(0.7, { duration: 180 });
    shadowOpacity.value = withTiming(0.15, { duration: 180 });
  };

  // Land pin smoothly when map movement ends
  const landPin = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    pinTranslateY.value = withSpring(0, {
      damping: 7,
      stiffness: 300,
      mass: 0.9,
    });

    pinScale.value = withSequence(
      withTiming(0.85, { duration: 90 }),
      withSpring(1, {
        damping: 7,
        stiffness: 260,
      })
    );

    pinRotation.value = withSequence(
      withTiming(5, { duration: 70 }),
      withSpring(0, { damping: 8, stiffness: 180 })
    );

    shadowScale.value = withSequence(
      withTiming(1.5, { duration: 100 }),
      withSpring(1, { damping: 9, stiffness: 180 })
    );

    shadowOpacity.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0.3, { duration: 350 })
    );

    rippleScale.value = 0.2;
    rippleOpacity.value = 0.75;

    rippleScale.value = withTiming(3.2, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });

    rippleOpacity.value = withDelay(
      80,
      withTiming(0, { duration: 570 })
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const reverseGeocode = async (point: Coordinates) => {
    const id = ++requestId.current;
    lastResolvedCoords.current = null;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResolved(false);

    try {
      if (!TOKEN) throw new Error("Mapbox token missing");

      const url =
        "https://api.mapbox.com/search/geocode/v6/reverse?" +
        `longitude=${point[0]}&latitude=${point[1]}` +
        "&types=address,street,neighborhood,locality,place" +
        "&limit=1" +
        `&access_token=${encodeURIComponent(TOKEN)}`;

      const response = await fetch(url, { signal: controller.signal });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Geocoding failed");
      }

      if (controller.signal.aborted || id !== requestId.current) return;

      const feature = data.features?.[0];

      if (feature) {
        const p = feature.properties;
        setAddress(
          p?.full_address ||
          p?.place_formatted ||
          p?.name ||
          "Selected map location"
        );
      } else {
        setAddress(`${point[1].toFixed(6)}, ${point[0].toFixed(6)}`);
      }

      setResolved(true);
    } catch (error) {
      if (controller.signal.aborted || id !== requestId.current) return;
      console.log("Reverse geocode error:", error);
      setAddress("Unable to find address. Move map to retry.");
      setResolved(false);
    } finally {
      if (!controller.signal.aborted && id === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    reverseGeocode(startingCoords);

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const latestCoords = useRef<Coordinates>(startingCoords);

  // 🚀 ONLY LIFT PIN ON NATIVE UI THREAD — NO REACT STATE RENDERS WHILE MOVING
//   const handleCameraChanged = (state: any) => {
//     const center = state?.properties?.center;
//     if (
//       !Array.isArray(center) ||
//       center.length !== 2 ||
//       !center.every(Number.isFinite)
//     ) {
//       return;
//     }

//     latestCoords.current = [center[0], center[1]];

//     if (!isDragging.current) {
//       liftPin();
//     }
//   };



const lastResolvedCoords = useRef<Coordinates | null>(null);
const mapMoving = useRef(false);

const handleCameraChanged = (state: any) => {
  const center = state?.properties?.center;

  if (
    !Array.isArray(center) ||
    center.length !== 2 ||
    !center.every(Number.isFinite)
  ) {
    return;
  }

  latestCoords.current = [center[0], center[1]];

  if (!mapMoving.current) {
    mapMoving.current = true;

    requestId.current += 1;
    abortRef.current?.abort();

    setResolved(false);
    setLoading(true);

    liftPin();
  }
};

const handleMapIdle = (state: any) => {
  const center = state?.properties?.center;

  const finalCoords: Coordinates =
    Array.isArray(center) &&
    center.length === 2 &&
    center.every(Number.isFinite)
      ? [center[0], center[1]]
      : latestCoords.current;

  latestCoords.current = finalCoords;

  const previous = lastResolvedCoords.current;

  const sameLocation =
    previous !== null &&
    Math.abs(previous[0] - finalCoords[0]) < 0.000001 &&
    Math.abs(previous[1] - finalCoords[1]) < 0.000001;

  if (mapMoving.current) {
    mapMoving.current = false;
    landPin();
  }

  if (sameLocation) return;

  lastResolvedCoords.current = finalCoords;
  setCoords(finalCoords);

  reverseGeocode(finalCoords);
};


  const confirm = () => {
    if (!resolved || loading) return;

    Keyboard.dismiss();

    onConfirm({
      id: `map-${mode}-${Date.now()}`,
      name: address.split(",")[0] || "Selected location",
      address,
      coordinates: coords,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#090D16" }}>
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Dark}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onCameraChanged={handleCameraChanged}
        onMapIdle={handleMapIdle}
      >
      

        <Mapbox.Camera
            ref={cameraRef}
            defaultSettings={{
                centerCoordinate: startingCoords,
                zoomLevel: 16,
            }}
        />
      </Mapbox.MapView>

      {/* FIXED ANIMATED PIN */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 110,
            height: 145,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          {/* Ground ripple */}
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 14,
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: color,
              },
              rippleAnimatedStyle,
            ]}
          />

          {/* Ground impact shadow */}
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 20,
                width: 20,
                height: 8,
                borderRadius: 10,
                backgroundColor: color,
              },
              shadowAnimatedStyle,
            ]}
          />

          {/* Main animated pin */}
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 25,
                alignItems: "center",
                justifyContent: "center",
              },
              pinAnimatedStyle,
            ]}
          >
            <Ionicons name="location" size={72} color={color} />

            <View
              style={{
                position: "absolute",
                top: 19,
                width: 17,
                height: 17,
                borderRadius: 9,
                backgroundColor: "#FFFFFF",
              }}
            />
          </Animated.View>
        </View>


      </View>

              
<View
  style={{
    position: "absolute",
    right: 16,
    bottom: 30,
    gap: 12,
  }}
>
  <TouchableOpacity
    onPress={() => {
      zoomRef.current = Math.min(20, zoomRef.current + 1);
      cameraRef.current?.zoomTo(zoomRef.current, 250);
    }}
    style={{
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#0F172A",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#334155",
    }}
  >
    <Ionicons name="add" size={25} color="#FFFFFF" />
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => {
      zoomRef.current = Math.max(10, zoomRef.current - 1);
      cameraRef.current?.zoomTo(zoomRef.current, 250);
    }}
    style={{
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#0F172A",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#334155",
    }}
  >
    <Ionicons name="remove" size={25} color="#FFFFFF" />
  </TouchableOpacity>
</View>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.8}
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 20,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: "#0F172A",
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* BOTTOM CONFIRMATION SHEET */}
      <View
        style={{
          backgroundColor: "#090D16",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingHorizontal: 22,
          paddingTop: 24,
          paddingBottom: insets.bottom + 20,
          borderTopWidth: 1,
          borderColor: "#1E293B",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 23,
            fontWeight: "800",
          }}
        >
          Confirm {mode} spot
        </Text>

        <Text style={{ color: "#94A3B8", marginTop: 8 }}>
          Drag the map to set your exact {mode} location
        </Text>

        <View
          style={{
            backgroundColor: "#1E293B",
            borderRadius: 15,
            padding: 16,
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="location-outline" size={22} color={color} />

          <Text
            numberOfLines={2}
            style={{
              flex: 1,
              color: "#FFFFFF",
              fontSize: 15,
              marginLeft: 12,
            }}
          >
            {address}
          </Text>

          {loading && (
            <ActivityIndicator size="small" color={color} style={{ marginLeft: 8 }} />
          )}
        </View>

        <TouchableOpacity
          onPress={confirm}
          disabled={loading || !resolved}
          activeOpacity={0.85}
          style={{
            marginTop: 18,
            backgroundColor: color,
            paddingVertical: 17,
            borderRadius: 16,
            alignItems: "center",
            opacity: loading || !resolved ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            Confirm {mode}
          </Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}