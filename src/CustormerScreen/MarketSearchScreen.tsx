import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BuyForMeItemsScreen from "./BuyForMeItemsScreen";
import BuyForMeReviewScreen from "./BuyForMeReviewScreen";

export type MarketItem = {
  id: string;
  name: string;
  category: "market" | "supermarket" | "store";
  address: string;
  city: string;
  coordinates: [number, number]; // [longitude, latitude]
  openHours: string;
  isOpen: boolean;
  image: string;
};

type Props = {
  userCoords: [number, number]; // [longitude, latitude]
  onBack: () => void;
  onSelectMarket?: (market: MarketItem) => void;
  onOrderComplete?: (orderData: any) => void;
};

// Mock data supporting international & local hubs
const ALL_MARKETS: MarketItem[] = [
  {
    id: "m-1",
    name: "Balogun Market",
    category: "market",
    address: "Lagos Island",
    city: "Lagos, Nigeria",
    coordinates: [3.3792, 6.4531],
    openHours: "6am - 6pm",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m-2",
    name: "Mile 12 Market",
    category: "market",
    address: "Ketu / Kosofe",
    city: "Lagos, Nigeria",
    coordinates: [3.3850, 6.5950],
    openHours: "6am - 6pm",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m-3",
    name: "Shoprite Ikeja City Mall",
    category: "supermarket",
    address: "Ikeja",
    city: "Lagos, Nigeria",
    coordinates: [3.3560, 6.6018],
    openHours: "8am - 10pm",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m-4",
    name: "Jumia Hub Store",
    category: "store",
    address: "Lekki Phase 1",
    city: "Lagos, Nigeria",
    coordinates: [3.4723, 6.4474],
    openHours: "9am - 9pm",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m-5",
    name: "Borough Market",
    category: "market",
    address: "Southwark",
    city: "London, UK",
    coordinates: [-0.0910, 51.5055],
    openHours: "8am - 5pm",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
  },
];

// Helper to calculate distance in KM between user and market
const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MarketSearchScreen({
  userCoords,
  onBack,
  onSelectMarket,
  onOrderComplete,
}: Props) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "market" | "supermarket" | "store"
  >("all");

  // Step state management: Step 1 (Search) -> Step 2 (Items) -> Step 3 (Review)
  const [selectedMarket, setSelectedMarket] = useState<MarketItem | null>(null);
  const [orderItemsData, setOrderItemsData] = useState<{
    items: any[];
    requireReceipt: boolean;
    totalEstimatedPrice: number;
  } | null>(null);

  const [userLng, userLat] = userCoords;

  // Filter and sort markets dynamically by proximity and search query
  const processedMarkets = useMemo(() => {
    return ALL_MARKETS.map((market) => {
      const [mLng, mLat] = market.coordinates;
      const distance = calculateDistanceKm(userLat, userLng, mLat, mLng);
      const estMins = Math.round(distance * 4);
      return { ...market, distance, estMins };
    })
      .filter((market) => {
        const matchesTab = activeTab === "all" || market.category === activeTab;
        const matchesSearch =
          market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          market.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          market.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [userLat, userLng, searchQuery, activeTab]);

  const handleMarketPress = (market: MarketItem) => {
    if (onSelectMarket) {
      onSelectMarket(market);
    }
    setSelectedMarket(market);
  };

// STEP 3: RENDER REVIEW & DISPATCH SCREEN
  if (selectedMarket && orderItemsData) {
    return (
      <BuyForMeItemsScreen
        market={selectedMarket}
        items={orderItemsData.items}
        requireReceipt={orderItemsData.requireReceipt}
        totalEstimatedPrice={orderItemsData.totalEstimatedPrice}
        currencySymbol="₦"
        onBack={() => setOrderItemsData(null)} // 👈 Uncomment this so tapping back takes them to Step 2 (Items)
        onConfirmOrder={(finalOrder) => {
          console.log("Order confirmed and rider dispatched:", finalOrder);
          if (onOrderComplete) {
            onOrderComplete(finalOrder);
          } else {
            onBack();
          }
        }}
      />
    );
  }

  // STEP 2: RENDER ITEM SELECTION SCREEN
  if (selectedMarket) {
    return (
      <BuyForMeItemsScreen
        market={selectedMarket}
        currencySymbol="₦"
        onBack={() => setSelectedMarket(null)}
        onContinue={(itemsData) => {
          setOrderItemsData(itemsData);
        }}
      />
    );
  }

  // STEP 1: RENDER MARKET SEARCH & EXPLORER SCREEN
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#030712]">
      {/* SEARCH HEADER */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-[#0F172A] border border-[#1E293B] items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center bg-[#0F172A] border border-[#1E293B] rounded-[22px] px-3.5 h-11 gap-2.5">
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search markets, stores, items..."
            placeholderTextColor="#64748B"
            className="flex-1 text-white text-sm"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CATEGORY TABS */}
      <View className="flex-row px-4 gap-2 mb-3.5">
        {(["all", "market", "supermarket", "store"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-[18px] border ${
                isActive
                  ? "bg-[#E11D48] border-[#E11D48]"
                  : "bg-[#0F172A] border-[#1E293B]"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-bold ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}s
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MARKET LIST SORTED BY PROXIMITY */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {processedMarkets.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleMarketPress(item)}
            className="flex-row bg-[#090E1A] border border-[#1E293B] rounded-[20px] p-3 mb-3 items-center"
            activeOpacity={0.85}
          >
            {/* REAL WEB IMAGE RENDER */}
            <Image
              source={{ uri: item.image }}
              className="w-20 h-20 rounded-[14px] bg-[#1E293B]"
              resizeMode="cover"
            />

            <View className="flex-1 ml-3.5">
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-white text-[15px] font-extrabold flex-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <View className="bg-emerald-500/15 px-2 py-0.5 rounded-lg">
                  <Text className="text-emerald-400 text-[9px] font-extrabold">
                    {item.category.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text className="text-slate-400 text-xs mt-1">
                {item.address}, {item.city}
              </Text>

              <View className="mt-2 gap-1">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <Text className="text-slate-200 text-[11px] font-semibold">
                    {item.distance < 1
                      ? `${(item.distance * 1000).toFixed(0)} m`
                      : `${item.distance.toFixed(1)} km`}{" "}
                    • {item.estMins} mins
                  </Text>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <View
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isOpen ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <Text className="text-slate-200 text-[11px] font-semibold">
                    {item.isOpen ? "Open" : "Closed"} • {item.openHours}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}