import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CustomerStackParamList } from "./Navigation/CustomerTabs";

import RouteSearchScreen, { type Place } from "./RouteSearchScreen";
import RideOptionsScreen, { type RideOption } from "./RideOptionsScreen";
import BottomSheet from './components/BottomSheet';
import DeliveryReviewScreen from "./DeliveryReviewScreen";
import DeliveryTrackingScreen, { type DeliveryTrackingData } from "./DeliveryTrackingScreen";
import { bookDeliveryOrder } from "../api/client";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const RECENT_DROPOFF_KEY = "@codaexpress_recent_dropoff";

if (!MAPBOX_TOKEN) {
  console.warn("Mapbox public token is missing from .env");
} else {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

const PackageDelivery = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  const [currentPickup, setCurrentPickup] = useState<Place | null>(null);
  const [recentDropoffName, setRecentDropoffName] = useState<string | null>(null);

  const [showRouteSearch, setShowRouteSearch] = useState(false);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{ pickup: Place; dropoff: Place } | null>(null);

  // Neutral initial coordinates until device GPS locks on
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [statusText, setStatusText] = useState("Looking for GPS...");
  const [isDark, setIsDark] = useState(true);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  const [showReview, setShowReview] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<RideOption | null>(null);
  const [trackingData, setTrackingData] = useState<DeliveryTrackingData | null>(null);

  // Dynamic nearby riders positioned relative to the user's live GPS anywhere in the world
  const nearbyRiders = useMemo(() => {
    if (!userCoords) return [];
    const [lng, lat] = userCoords;
    return [
      { id: 'bike-1', type: 'bike', coords: [lng + 0.0028, lat + 0.0016] as [number, number], image: require('../../assets/bisycle_move.png') },
      { id: 'car-1', type: 'car', coords: [lng - 0.0042, lat - 0.0024] as [number, number], image: require('../../assets/car.png') },
    ];
  }, [userCoords]);

  // Load saved recent drop-off location dynamically on mount
  useEffect(() => {
    AsyncStorage.getItem(RECENT_DROPOFF_KEY)
      .then((saved) => {
        if (saved) setRecentDropoffName(saved);
      })
      .catch((err) => console.log("Recent dropoff read error:", err));
  }, []);

  // INSTANT INTERNATIONAL GPS EFFECT
  useEffect(() => {
    let isMounted = true;

    async function initInstantGPS() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) setStatusText("GPS Permission denied");
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown && isMounted) {
          const { longitude, latitude } = lastKnown.coords;
          setUserCoords([longitude, latitude]);
          setStatusText("CodaExpress Active");

          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }).start();

          setCurrentPickup({
            id: "gps-pickup",
            name: "Current Location",
            address: "Fetching address...",
            coordinates: [longitude, latitude],
          });
        }

        const freshLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { longitude, latitude } = freshLocation.coords;
        if (isMounted) {
          setUserCoords([longitude, latitude]);
          setStatusText("CodaExpress Active");

          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }).start();
        }

        Location.reverseGeocodeAsync({ latitude, longitude })
          .then((addresses) => {
            if (!isMounted || !addresses.length) return;
            const address = addresses[0];
            const street = [address.streetNumber, address.street].filter(Boolean).join(" ");
            const name = street || address.name || address.district || "Current location";

            setCurrentPickup({
              id: "gps-pickup",
              name,
              address: [address.city, address.region, address.country].filter(Boolean).join(", "),
              coordinates: [longitude, latitude],
            });
          })
          .catch((err) => console.log("Background reverse geocode error:", err));

      } catch (error) {
        console.log("GPS Init Error:", error);
        if (isMounted) setStatusText("Enable GPS to locate");
      }
    }

    initInstantGPS();

    return () => {
      isMounted = false;
    };
  }, []);

  // Map UI RideOption to Django VehicleRequirement choices
  const mapVehicleTier = (vehicle: RideOption): 'BICYCLE' | 'MOTORCYCLE' | 'CAR' => {
    const raw = (vehicle.id || vehicle.name || '').toUpperCase();
    if (raw.includes('BICYCLE') || raw.includes('CYCLE')) return 'BICYCLE';
    if (raw.includes('CAR')) return 'CAR';
    return 'MOTORCYCLE';
  };

  // 1. FULL-SCREEN ROUTE SEARCH MODAL
  if (showRouteSearch) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RouteSearchScreen
          onBack={() => setShowRouteSearch(false)}
          initialPickup={selectedRoute?.pickup ?? currentPickup}
          onContinue={async (route) => {
            setSelectedRoute(route);
            setRecentDropoffName(route.dropoff.name);
            AsyncStorage.setItem(RECENT_DROPOFF_KEY, route.dropoff.name).catch(() => {});
            setShowRouteSearch(false);
            setShowRideOptions(true);
          }}
        />
      </GestureHandlerRootView>
    );
  }

  // 2. LIVE TRACKING SCREEN
  if (
    showTracking &&
    selectedRoute &&
    selectedVehicle &&
    trackingData
  ) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DeliveryTrackingScreen
          route={selectedRoute}
          vehicle={selectedVehicle}
          tracking={trackingData}
          onBack={() => {
            setShowTracking(false);
            setShowReview(true);
          }}
        />
      </GestureHandlerRootView>
    );
  }

  // 3. RIDE OPTIONS SCREEN
  if (showRideOptions && selectedRoute) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RideOptionsScreen
          route={selectedRoute}
          onBack={() => {
            setShowRideOptions(false);
            setShowRouteSearch(true);
          }}
          onConfirm={(vehicle) => {
            setSelectedVehicle(vehicle);
            setShowRideOptions(false);
            setShowReview(true);
          }}
        />
      </GestureHandlerRootView>
    );
  }

  // 4. DELIVERY REVIEW SCREEN (Books real Order on Django & Transitions to FindingRider)
  if (showReview && selectedRoute && selectedVehicle) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DeliveryReviewScreen
          route={selectedRoute}
          vehicle={selectedVehicle}
          onBack={() => {
            setShowReview(false);
            setShowRideOptions(true);
          }}
          onEditLocations={() => {
            setShowReview(false);
            setShowRouteSearch(true);
          }}
          onConfirm={async (details?: {
            pickupContactName?: string;
            pickupContactPhone?: string;
            dropoffContactName?: string;
            dropoffContactPhone?: string;
            packageType?: string;
            descriptions?: string;
          }) => {
            try {
              const createdOrder = await bookDeliveryOrder({
                pickup_address: selectedRoute.pickup.address || selectedRoute.pickup.name,
                pickup_contact_name: details?.pickupContactName || "Sender",
                pickup_contact_phone: details?.pickupContactPhone || "",
                dropoff_address: selectedRoute.dropoff.address || selectedRoute.dropoff.name,
                dropoff_contact_name: details?.dropoffContactName || "Recipient",
                dropoff_contact_phone: details?.dropoffContactPhone || "",
                package_type: details?.packageType || "Standard Parcel",
                descriptions: details?.descriptions || "",
                required_vehicle: mapVehicleTier(selectedVehicle),
                distance: selectedVehicle.distance || "3.5 km",
                estimated_earnings: Number(selectedVehicle.price) || 2600,
              });

              setShowReview(false);
              navigation.navigate("FindingRider", {
                orderId: String(createdOrder.id),
                dropoffPin: createdOrder.dropoff_pin,
                pickup: selectedRoute.pickup.name,
                dropoff: selectedRoute.dropoff.name,
                price: String(createdOrder.dynamic_earnings ?? selectedVehicle.price),
                serviceType: "delivery",
              });
            } catch (error: any) {
              console.error("Booking failed:", error?.response?.data || error);
              Alert.alert(
                "Booking Failed",
                error?.response?.data?.detail || "Unable to place order. Please check your connection and try again."
              );
            }
          }}
        />
      </GestureHandlerRootView>
    );
  }

  // 5. MAIN MAP VIEW & BOTTOM SHEET
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Mapbox.MapView 
          style={styles.map} 
          styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
          scaleBarEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          pitchEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {userCoords && (
            <Mapbox.Camera
              zoomLevel={15}
              centerCoordinate={userCoords}
              animationMode={'flyTo'}
            />
          )}

          {userCoords && (
            <Mapbox.MarkerView id="userAvatarMarker" coordinate={userCoords}>
              <Animated.View style={[styles.pinWrapper, { transform: [{ scale: bounceAnim }] }]}>
                <View style={styles.avatarContainer}>
                  <Image 
                    source={require('../../assets/MinimalPinkDefaultAvatarIcon.png')} 
                    style={styles.avatarImage} 
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.pinStem} />
              </Animated.View>
            </Mapbox.MarkerView>
          )}

          {nearbyRiders.map((rider) => (
            <Mapbox.MarkerView key={rider.id} id={rider.id} coordinate={rider.coords}>
              <View style={styles.vehicleContainer}>
                <Image 
                  source={rider.image} 
                  style={styles.vehicleImage} 
                  resizeMode="cover"
                />
              </View>
            </Mapbox.MarkerView>
          ))}

          {selectedRoute?.dropoff?.coordinates && (
            <Mapbox.MarkerView id="selectedDropoffMarker" coordinate={selectedRoute.dropoff.coordinates}>
              <View style={styles.vehicleContainer}>
                <Image 
                  source={require('../../assets/location.png')} 
                  style={styles.vehicleImage} 
                  resizeMode="cover"
                />
              </View>
            </Mapbox.MarkerView>
          )}
        </Mapbox.MapView>

        {/* TOP FLOATING BAR */}
        <View style={[styles.topBar, { top: insets.top + 10 }]} pointerEvents="box-none">
          <View style={styles.statusBox}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{statusText}</Text>
          </View>
          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setIsDark(!isDark)}
            activeOpacity={0.8}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* DRAGGABLE BOTTOM SHEET */}
        <BottomSheet
          bottomOffset={insets.bottom + 12}
          maxDrag={-300}
          destination={selectedRoute?.dropoff.name ?? recentDropoffName}
          onVehicleSelect={(vehicle) => console.log("Selected vehicle:", vehicle)}
          onSearchPress={() => setShowRouteSearch(true)}
          onLocationPress={() => setShowRouteSearch(true)}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default PackageDelivery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  statusBox: {
    backgroundColor: 'rgba(9, 13, 22, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleButton: {
    backgroundColor: '#E11D48',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  pinWrapper: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27, 
    backgroundColor: '#090D16', 
    borderWidth: 3,
    borderColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarImage: {
    width: 54,
    height: 54,
  },
  vehicleContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#090D16',
    borderWidth: 2,
    borderColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  vehicleImage: {
    width: 46,
    height: 46,
  },
  pinStem: {
    width: 4,
    height: 14,
    backgroundColor: '#E11D48',
    borderRadius: 2,
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
});