import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RouteSearchScreen, { type Place } from "./RouteSearchScreen";
import RideOptionsScreen, { type RideOption } from "./RideOptionsScreen";
import BottomSheet from './components/BottomSheet';
import DeliveryReviewScreen from "./DeliveryReviewScreen";
import DeliveryTrackingScreen, { type DeliveryTrackingData } from "./DeliveryTrackingScreen";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.warn("Mapbox public token is missing from .env");
} else {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

const PackageDelivery = () => {
  const [currentPickup, setCurrentPickup] = useState<Place | null>(null);
  const insets = useSafeAreaInsets();

  const [showRouteSearch, setShowRouteSearch] = useState(false);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{ pickup: Place; dropoff: Place } | null>(null);

  const [userCoords, setUserCoords] = useState<[number, number]>([3.3792, 6.5244]);
  const [statusText, setStatusText] = useState("Looking for GPS...");
  const [isDark, setIsDark] = useState(true);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  const [showReview, setShowReview] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<RideOption | null>(null);
  const [trackingData, setTrackingData] = useState<DeliveryTrackingData | null>(null);

  const [nearbyRiders] = useState([
    { id: 'bike-1', type: 'bike', coords: [3.3820, 6.5260] as [number, number], image: require('../../assets/bisycle_move.png') },
    { id: 'car-1', type: 'car', coords: [3.3750, 6.5220] as [number, number], image: require('../../assets/car.png') },
    { id: 'destination', type: 'dropoff', coords: [3.3850, 6.5280] as [number, number], image: require('../../assets/location.png') },
  ]);

  // GPS EFFECT
  useEffect(() => {
    async function getGPS() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStatusText("Permission denied!");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { longitude, latitude } = location.coords;

      setUserCoords([longitude, latitude]);
      setStatusText(`Found you! CodaExpress active.`);

      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const address = addresses[0];

        if (address) {
          const street = [
            address.streetNumber,
            address.street,
          ]
            .filter(Boolean)
            .join(" ");

          const name =
            street ||
            address.name ||
            address.district ||
            "Current location";

          setCurrentPickup({
            id: "gps-pickup",
            name,
            address: [
              address.city,
              address.region,
              address.country,
            ]
              .filter(Boolean)
              .join(", "),
            coordinates: [longitude, latitude],
          });
        }
      } catch (error) {
        console.log("Reverse geocoding failed:", error);
      }
    }

    getGPS();
  }, []);

  // 1. FULL-SCREEN ROUTE SEARCH MODAL
  if (showRouteSearch) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RouteSearchScreen
          onBack={() => setShowRouteSearch(false)}
          initialPickup={selectedRoute?.pickup ?? currentPickup}
          onContinue={(route) => {
            setSelectedRoute(route);
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

  // 4. DELIVERY REVIEW SCREEN
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
          onConfirm={() => {
            setTrackingData({
              orderId: "CE-89241",
              status: "picked_up",
              riderName: "Daniel K.",
              riderPhone: "+2348123456789",
              riderRating: "4.8",
              riderTrips: 124,
              deliveryPin: "8492",
              etaMins: 18,
              distanceKm: 2.4,
              riderCoordinates: [3.3820, 6.5260],
            });

            setShowReview(false);
            setShowTracking(true);
          }}
        />
      </GestureHandlerRootView>
    );
  }

  // 5. MAIN MAP VIEW & BOTTOM SHEET
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* MAPBOX MAP LAYER */}
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
          <Mapbox.Camera
            zoomLevel={15}
            centerCoordinate={userCoords}
            animationMode={'flyTo'}
          />

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
          destination={selectedRoute?.dropoff.name ?? null}
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