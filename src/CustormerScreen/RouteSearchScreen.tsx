import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import LocationPickerMap from "./LocationPickerMap";

export type Place = {
  id: string;
  name: string;
  address: string;
  coordinates?: [number, number];
};

type Field = "pickup" | "dropoff";

interface RouteSearchProps {
  onBack: () => void;
  onContinue?: (route: { pickup: Place; dropoff: Place }) => void;
  initialPickup?: Place | null;
}

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiaW5ub2NvZGEiLCJhIjoiY212ZjE3NXBnMDBndTJ5cjI2bnkzejg1eiJ9.qbPEK--lMHUSft-0yMqRsg';

const DEFAULT_PLACES: Place[] = [
  { id: "1", name: "5b Admiralty Way", address: "Lekki Phase 1, Lagos", coordinates: [3.4723, 6.4474] },
  { id: "2", name: "Murtala Muhammed Airport", address: "Ikeja, Lagos", coordinates: [3.3211, 6.5778] },
  { id: "3", name: "Elegushi Beach", address: "Lekki, Lagos", coordinates: [3.4882, 6.4353] },
  { id: "4", name: "Ajah Market", address: "Ajah, Lagos", coordinates: [3.5653, 6.4684] },
  { id: "5", name: "Shoprite Ikeja City Mall", address: "Obafemi Awolowo Way, Ikeja", coordinates: [3.3592, 6.6018] },
];

const searchLocations = async (
  query: string,
  signal: AbortSignal
): Promise<Place[]> => {
  if (!MAPBOX_TOKEN) {
    throw new Error("Mapbox token missing.");
  }

  const params = [
    `q=${encodeURIComponent(query.trim())}`,
    `access_token=${encodeURIComponent(MAPBOX_TOKEN)}`,
    "autocomplete=true",
    "country=ng",
    "limit=10",
    "proximity=3.3792,6.5244",
  ].join("&");

  const url = `https://api.mapbox.com/search/geocode/v6/forward?${params}`;

  const response = await fetch(url, { signal });
  const data = await response.json();

  return (data.features ?? [])
    .map((feature: any, index: number): Place | null => {
      const properties = feature.properties;
      const longitude = properties?.coordinates?.longitude ?? feature.geometry?.coordinates?.[0];
      const latitude = properties?.coordinates?.latitude ?? feature.geometry?.coordinates?.[1];

      if (typeof longitude !== "number" || typeof latitude !== "number") {
        return null;
      }

      return {
        id: properties?.mapbox_id ?? feature.id ?? `result-${index}`,
        name: properties?.name_preferred ?? properties?.name ?? properties?.full_address ?? "Unknown location",
        address: properties?.full_address ?? properties?.place_formatted ?? "Nigeria",
        coordinates: [longitude, latitude],
      };
    })
    .filter((place: Place | null): place is Place => place !== null);
};

export default function RouteSearchScreen({
  onBack,
  onContinue,
  initialPickup,
}: RouteSearchProps) {
  const insets = useSafeAreaInsets();

  const fallbackCoords: [number, number] = initialPickup?.coordinates ?? [3.4723, 6.4474];
  const initialName = initialPickup?.name ?? "Current Location";

  const [pickupText, setPickupText] = useState(initialName);
  const [dropoffText, setDropoffText] = useState("");

  const [pickupPlace, setPickupPlace] = useState<Place | null>({
    id: "current-loc",
    name: initialName,
    address: "Lagos, Nigeria",
    coordinates: fallbackCoords,
  });
  const [dropoffPlace, setDropoffPlace] = useState<Place | null>(null);

  const [activeField, setActiveField] = useState<Field>("dropoff");
  const [places, setPlaces] = useState<Place[]>(DEFAULT_PLACES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchExactStreetAddress() {
      if (initialPickup?.coordinates) {
        try {
          const [longitude, latitude] = initialPickup.coordinates;
          const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

          if (reverseGeocode && reverseGeocode.length > 0) {
            const loc = reverseGeocode[0];
            const streetName = loc.street || loc.name || loc.district || "Current Location";
            const cityName = loc.city || loc.subregion || "Lagos";

            setPickupText(streetName);
            setPickupPlace({
              id: "exact-gps-loc",
              name: streetName,
              address: `${cityName}, Nigeria`,
              coordinates: [longitude, latitude],
            });
          }
        } catch (error) {
          console.log("Reverse geocode error:", error);
        }
      }
    }
    fetchExactStreetAddress();
  }, [initialPickup]);

  const activeQuery = activeField === "pickup" ? pickupText : dropoffText;

  useEffect(() => {
    const query = activeQuery.trim();

    if (query.length < 2) {
      setPlaces(DEFAULT_PLACES);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const timer = setTimeout(async () => {
      if (!isActive) return;
      setIsLoading(true);

      try {
        const results = await searchLocations(query, controller.signal);
        if (!isActive || controller.signal.aborted) return;
        setPlaces(results);
      } catch (error: any) {
        if (!isActive || controller.signal.aborted) return;
        const message = String(error?.message ?? error);
        if (error?.name === "AbortError" || message.toLowerCase().includes("cancel")) {
          return;
        }
        setPlaces([]);
      } finally {
        if (isActive && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 450);

    return () => {
      isActive = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeQuery]);

  const selectPlace = (place: Place) => {
    if (activeField === "pickup") {
      setPickupText(place.name);
      setPickupPlace(place);
      setActiveField("dropoff");
    } else {
      setDropoffText(place.name);
      setDropoffPlace(place);
    }
    Keyboard.dismiss();
  };

const swapLocations = () => {
  Keyboard.dismiss();

  const oldPickupText = pickupText;
  const oldDropoffText = dropoffText;
  const oldPickupPlace = pickupPlace;
  const oldDropoffPlace = dropoffPlace;

  setPickupText(oldDropoffText);
  setDropoffText(oldPickupText);

  setPickupPlace(oldDropoffPlace);
  setDropoffPlace(oldPickupPlace);

  setActiveField("pickup");
};

  // 🟢 ALLOW CONTINUING AS LONG AS BOTH TEXT INPUTS HAVE TEXT
  const canContinue = pickupText.trim().length > 0 && dropoffText.trim().length > 0;

  const handleConfirmLocations = () => {
    const finalPickup: Place = pickupPlace ?? {
      id: `manual-pickup-${Date.now()}`,
      name: pickupText.trim() || "Pickup Location",
      address: "Lagos, Nigeria",
      coordinates: fallbackCoords,
    };

    const finalDropoff: Place = dropoffPlace ?? {
      id: `manual-dropoff-${Date.now()}`,
      name: dropoffText.trim() || "Dropoff Destination",
      address: "Lagos State, Nigeria",
      coordinates: [fallbackCoords[0] + 0.015, fallbackCoords[1] + 0.015],
    };

    Keyboard.dismiss();
    onContinue?.({
      pickup: finalPickup,
      dropoff: finalDropoff,
    });
  };

  const [mapPickerMode, setMapPickerMode] = useState<"pickup" | "dropoff" | null>(null);

  if (mapPickerMode) {
    return (
      <LocationPickerMap
        mode={mapPickerMode}
        initialCoordinates={
          mapPickerMode === "pickup"
            ? pickupPlace?.coordinates ?? initialPickup?.coordinates
            : dropoffPlace?.coordinates ?? initialPickup?.coordinates
        }
        onBack={() => setMapPickerMode(null)}
        onConfirm={(place) => {
          if (mapPickerMode === "pickup") {
            setPickupPlace(place);
            setPickupText(place.name);
          } else {
            setDropoffPlace(place);
            setDropoffText(place.name);
          }
          setMapPickerMode(null);
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: "#06090F",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* HEADER */}
      <View className="px-5 py-4 flex-row items-center border-b border-slate-800/80 bg-[#06090F]">
        <TouchableOpacity
          onPress={onBack}
          className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center shadow-lg"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-white text-xl font-extrabold tracking-tight">
            Plan your route
          </Text>
          <Text className="text-slate-400 text-xs">CodaExpress Delivery</Text>
        </View>
      </View>

      {/* LUXURY ROUTE INPUT CONTAINER */}
      <View className="mx-5 mt-5 bg-[#0A0F1D] border border-slate-800/80 rounded-3xl p-4 shadow-2xl relative">
        <View className="absolute left-[31px] top-[48px] bottom-[48px] w-0.5 bg-slate-800 z-0" />

        {/* PICKUP ROW */}
        <View className={`flex-row items-center p-3 rounded-2xl z-10 transition-all ${activeField === "pickup" ? "bg-slate-900/90 border border-emerald-500/50 shadow-md" : "bg-transparent"}`}>
          <View className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
            <Ionicons name="radio-button-on" size={16} color="#10B981" />
          </View>
              
        <View className="flex-1 ml-3.5">
          <Text className="text-emerald-400 text-[9px] font-black tracking-widest uppercase">
            Pickup Location
          </Text>

          <TextInput
            value={pickupText}
            onFocus={() => {
              console.log("Pickup input focused");
            }}
            onChangeText={(text) => {
              setPickupText(text);
              setPickupPlace(null);
            }}
            placeholder="Where should we pick up?"
            placeholderTextColor="#64748B"
            className="text-white text-sm font-bold py-0.5"
            autoCorrect={false}
          />
        </View>


        {pickupText.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setPickupText("");
                setPickupPlace(null);
              }}
              activeOpacity={0.7}
              className="p-2 items-center justify-center"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setMapPickerMode("pickup")}
            className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center ml-2"
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={18} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* SWAP BUTTON DIVIDER */}
        <View className="flex-row items-center my-1.5 z-10">
          <View className="flex-1 h-[1px] bg-slate-800/60 ml-11" />
         {/* SWAP BUTTON */}
          <TouchableOpacity
            onPress={swapLocations}
            activeOpacity={0.8}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 items-center justify-center mx-3 shadow-md"
          >
            <Ionicons
              name="swap-vertical"
              size={16}
              color="#E11D48"
            />
          </TouchableOpacity>
        </View>

        {/* DROPOFF ROW */}
        <View className={`flex-row items-center p-3 rounded-2xl z-10 transition-all ${activeField === "dropoff" ? "bg-slate-900/90 border border-rose-500/50 shadow-md" : "bg-transparent"}`}>
          <View className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 items-center justify-center">
            <Ionicons name="location" size={16} color="#E11D48" />
          </View>
          <View className="flex-1 ml-3.5">
            <Text className="text-rose-400 text-[9px] font-black tracking-widest uppercase">Dropoff Destination</Text>
            <TextInput
              value={dropoffText}
              onFocus={() => setActiveField("dropoff")}
              onChangeText={(val) => {
                setDropoffText(val);
                setDropoffPlace(null);
                setActiveField("dropoff");
              }}
              placeholder="Where are we delivering?"
              placeholderTextColor="#64748B"
              className="text-white text-sm font-bold py-0.5"
            />
          </View>

          {dropoffText.length > 0 && (
            <TouchableOpacity onPress={() => { setDropoffText(""); setDropoffPlace(null); setActiveField("dropoff"); }} className="p-1">
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setMapPickerMode("dropoff")}
            className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center ml-2"
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={18} color="#E11D48" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SUGGESTED / LIVE RESULTS LIST */}
      <View className="flex-1 mt-5">
        <View className="flex-row justify-between items-center px-6 mb-2.5">
          <Text className="text-slate-400 text-[11px] font-black uppercase tracking-wider">
            {activeQuery.trim() ? "Live Search Results" : "Suggested Places"}
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#E11D48" />}
        </View>

        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectPlace(item)}
              activeOpacity={0.8}
              className="flex-row items-center bg-[#0B101D] border border-slate-800/60 px-4 py-3.5 rounded-2xl mb-2 shadow-sm"
            >
              <View className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center">
                <Ionicons name="location-outline" size={18} color="#E11D48" />
              </View>
              <View className="flex-1 ml-3.5">
                <Text className="text-white text-sm font-bold" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
              <View className="w-7 h-7 rounded-full bg-slate-900 items-center justify-center border border-slate-800">
                <Ionicons name="chevron-forward" size={14} color="#64748B" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* STICKY BOTTOM CONFIRM BUTTON */}
      <View className="px-5 pt-3 pb-2 bg-[#06090F] border-t border-slate-800/80 shadow-2xl">
        <TouchableOpacity
          disabled={!canContinue}
          onPress={handleConfirmLocations}
          activeOpacity={0.85}
          className={`rounded-2xl py-4 flex-row items-center justify-center shadow-lg ${
            canContinue ? "bg-[#E11D48] shadow-rose-900/30" : "bg-slate-800 opacity-40"
          }`}
        >
          <Text className="text-white font-extrabold text-base tracking-wide">
            Confirm locations
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}