import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  onConfirm: (details: {
    pickupContactName: string;
    pickupContactPhone: string;
    dropoffContactName: string;
    dropoffContactPhone: string;
    packageType: string;
    descriptions: string;
  }) => void | Promise<void>;
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
  const [routeError, setRouteError] = useState<string | null>(null);

  const [routeGeometry, setRouteGeometry] =
    useState<RouteGeometry | null>(null);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);

  // Prefilled & wider contact fields (editable)
  const [pickupContactName, setPickupContactName] = useState("Sender");
  const [pickupContactPhone, setPickupContactPhone] = useState(""); // Prefilled from login session
  const [dropoffContactName, setDropoffContactName] = useState("Recipient");
  const [dropoffContactPhone, setDropoffContactPhone] = useState("");
  const [packageType, setPackageType] = useState("Standard Parcel");
  const [descriptions, setDescriptions] = useState("");

  const pickup = route.pickup.coordinates;
  const dropoff = route.dropoff.coordinates;

  const validPickup = isValidCoordinates(pickup);
  const validDropoff = isValidCoordinates(dropoff);
  const good = validPickup && validDropoff;




 // Load the authenticated user's real phone number on mount
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const storedPhone = await AsyncStorage.getItem("@codaexpress_user_phone");
        const storedUser = await AsyncStorage.getItem("@codaexpress_user_profile");
        const tokenPhone = await AsyncStorage.getItem("phone_number"); // Fallback key check
        
        if (storedPhone) {
          setPickupContactPhone(storedPhone);
        } else if (tokenPhone) {
          setPickupContactPhone(tokenPhone);
        } else if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.phone_number) {
            setPickupContactPhone(parsed.phone_number);
          }
        }
      } catch (err) {
        console.log("Failed to load user phone from storage:", err);
      }
    }
    loadUserProfile();
  }, []);

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
      paddingBottom: 340,
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

    if (!pickupContactPhone.trim() || !dropoffContactPhone.trim()) {
      Alert.alert("Missing Information", "Please provide phone numbers for both sender and recipient.");
      return;
    }

    confirmationLocked.current = true;
    setBusy(true);

    try {
      await onConfirm({
        pickupContactName: pickupContactName.trim() || "Sender",
        pickupContactPhone: pickupContactPhone.trim(),
        dropoffContactName: dropoffContactName.trim() || "Recipient",
        dropoffContactPhone: dropoffContactPhone.trim(),
        packageType: packageType.trim() || "Standard Parcel",
        descriptions: descriptions.trim(),
      });
    } catch (error) {
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
        [120, 60, 340, 60],
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
    <View style={styles.root}>
      {/* 1. MAPBOX MAP FILLING ENTIRE BACKGROUND */}
      <View style={styles.mapContainer}>
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
                <View style={styles.markerCircleGreen}>
                  <Ionicons name="radio-button-on" size={14} color="#FFF" />
                </View>
              </Mapbox.MarkerView>
            )}

            {/* DROPOFF MARKER */}
            {validDropoff && (
              <Mapbox.MarkerView id="review-dropoff" coordinate={dropoff}>
                <View style={styles.markerCircleRed}>
                  <Ionicons name="location" size={16} color="#FFF" />
                </View>
              </Mapbox.MarkerView>
            )}
          </Mapbox.MapView>
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.fallbackText}>Select valid locations to preview map</Text>
          </View>
        )}
      </View>

      {/* 2. FLOATING HEADER CONTROLS */}
      <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.routeBadge}>
          <Ionicons name="navigate" size={15} color="#10B981" />
          <Text style={styles.routeBadgeText}>
            {routeLoading
              ? "Calculating route..."
              : distanceKm !== null && durationMin !== null
              ? `${distanceKm.toFixed(1)} km • ${Math.ceil(durationMin)} mins`
              : "Review Route"}
          </Text>
        </View>

        <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter} activeOpacity={0.8}>
          <Ionicons name="locate" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 3. WIDER & PREFILLED CONTACT EDIT SHEET */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.handle} />

          {/* ROUTE SUMMARY CARD */}
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.dotGreen} />
              <Text style={styles.routeText} numberOfLines={1}>
                {route.pickup.name || route.pickup.address}
              </Text>
              <TouchableOpacity onPress={onEditLocations}>
                <Ionicons name="pencil" size={14} color="#38BDF8" />
              </TouchableOpacity>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeRow}>
              <View style={styles.dotRed} />
              <Text style={styles.routeText} numberOfLines={1}>
                {route.dropoff.name || route.dropoff.address}
              </Text>
            </View>
          </View>

          {/* WIDER CONTACT & PACKAGE EDIT FIELDS */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Sender & Recipient Contacts (Editable)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sender Phone (Prefilled)</Text>
              <TextInput
                style={styles.wideInput}
                placeholder="Sender Phone number"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={pickupContactPhone}
                onChangeText={setPickupContactPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient Phone</Text>
              <TextInput
                style={styles.wideInput}
                placeholder="Enter recipient phone number"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={dropoffContactPhone}
                onChangeText={setDropoffContactPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Package Description / Type</Text>
              <TextInput
                style={styles.wideInput}
                placeholder="e.g. Documents, Electronics, Fragile"
                placeholderTextColor="#64748B"
                value={packageType}
                onChangeText={setPackageType}
              />
            </View>
          </View>

          {/* VEHICLE + CONFIRM ROW */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={onEditLocations} style={styles.vehicleTile} activeOpacity={0.8}>
              <Ionicons name="bicycle" size={20} color="#E11D48" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.vehicleName} numberOfLines={1}>{vehicle.name}</Text>
                <Text style={styles.vehiclePrice}>{vehicle.price}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!good || busy}
              activeOpacity={0.85}
              style={[styles.confirmButton, (!good || busy) && { opacity: 0.5 }]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.confirmText}>Dispatch Rider</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#06090F",
  },
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0B101D",
  },
  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  routeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 8,
  },
  routeBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  recenterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  markerCircleGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  markerCircleRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E11D48",
    borderWidth: 2,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  mapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: "#64748B",
    fontSize: 13,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#090D16",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 18,
    paddingTop: 10,
    maxHeight: '72%',
    elevation: 12,
    zIndex: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#334155",
    alignSelf: "center",
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 12,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E11D48",
  },
  routeLine: {
    width: 2,
    height: 10,
    backgroundColor: "#334155",
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  inputSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  wideInput: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    width: "100%",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  vehicleTile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },
  vehicleName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  vehiclePrice: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "800",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E11D48",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});