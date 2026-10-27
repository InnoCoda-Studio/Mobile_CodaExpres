import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import Mapbox from '@rnmapbox/maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MarketSearchScreen, { type MarketItem } from '../CustormerScreen/MarketSearchScreen';

import CustomerHeader from '../CustormerScreen/components/CustomerHeader';

// Configure Mapbox Token
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

// Lagos District Coordinates Dictionary [longitude, latitude]
const LOCATION_COORDINATES: { [key: string]: [number, number] } = {
  "Lagos, Nigeria": [3.3792, 6.5244],
  "Lekki Phase 1, Lagos": [3.4723, 6.4474],
  "Victoria Island, Lagos": [3.4219, 6.4281],
  "Ikoyi, Lagos": [3.4246, 6.4549],
  "Ikeja City Mall, Lagos": [3.3515, 6.6018],
  "Yaba, Lagos": [3.3897, 6.5158],
  "Ajah Market, Lagos": [3.5653, 6.4684],
};

const DEFAULT_COORDS: [number, number] = [3.3792, 6.5244];

// Popular Markets Data
const POPULAR_MARKETS = [
  {
    id: '1',
    name: 'Balogun Market',
    location: 'Lagos Island',
    duration: '12 min',
    distance: '3.2 km',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80',
    coords: [3.3887, 6.4549] as [number, number],
  },
  {
    id: '2',
    name: 'Mile 12 Market',
    location: 'Kosofe, Lagos',
    duration: '18 min',
    distance: '7.5 km',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    coords: [3.3862, 6.6111] as [number, number],
  },
  {
    id: '3',
    name: 'Tejuosho Market',
    location: 'Yaba, Lagos',
    duration: '10 min',
    distance: '2.1 km',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80',
    coords: [3.3644, 6.5123] as [number, number],
  },
  {
    id: '4',
    name: 'Lekki Arts & Crafts',
    location: 'Lekki Phase 1',
    duration: '15 min',
    distance: '5.0 km',
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    coords: [3.4688, 6.4389] as [number, number],
  },
];

export default function CustomerHomeScreen() {
  const [selectedLocation, setSelectedLocation] = useState("Lagos, Nigeria");
  const [mapCoords, setMapCoords] = useState<[number, number]>(DEFAULT_COORDS);
  const [showMarketSearch, setShowMarketSearch] = useState(false); // 👈 Added Market Search Screen State


  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark' || true;
  const navigation = useNavigation();

  const handleLocationChange = (newLocation: string) => {
    setSelectedLocation(newLocation);
    const coords = LOCATION_COORDINATES[newLocation];
    if (coords && Array.isArray(coords) && coords.length === 2) {
      setMapCoords(coords);
    } else {
      setMapCoords(DEFAULT_COORDS);
    }
  };

  const handleMarketSelect = (market: typeof POPULAR_MARKETS[0]) => {
    setSelectedLocation(`${market.name}, Lagos`);
    if (market.coords && Array.isArray(market.coords)) {
      setMapCoords(market.coords);
    }
  };

  const safeCoords = Array.isArray(mapCoords) && mapCoords.length === 2 ? mapCoords : DEFAULT_COORDS;

  const nearbyVehicles = [
    { 
      id: 'bike-1', 
      coords: [safeCoords[0] + 0.003, safeCoords[1] + 0.002] as [number, number], 
      image: require('../../assets/bisycle_move.png') 
    },
    { 
      id: 'car-1', 
      coords: [safeCoords[0] - 0.002, safeCoords[1] - 0.003] as [number, number], 
      image: require('../../assets/car.png') 
    },
  ];

  // 🛍️ RENDER MARKET SEARCH SCREEN WHEN ACTIVE
  if (showMarketSearch) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MarketSearchScreen
          userCoords={safeCoords}
          onBack={() => setShowMarketSearch(false)}
          onSelectMarket={(market: MarketItem) => {
            console.log("Selected market from explorer:", market.name);
            setShowMarketSearch(false);
            // Optional: Update map coords to selected market
            if (market.coordinates) {
              setMapCoords(market.coordinates);
            }
          }}
        />
      </GestureHandlerRootView>
    );
  }


  return (
    <View className="flex-1 bg-[#090D16]">
      {/* Header */}
      <CustomerHeader
        selectedLocation={selectedLocation}
        onSelectLocation={handleLocationChange}
        walletBalance="₦15,400"
        onTopUpPress={() => console.log("Top Up pressed")}
        onNotificationPress={() => console.log("Notification pressed")}
      />

      {/* Main Dashboard Scroll Area */}
      <ScrollView 
        className="flex-1 bg-[#090D16] px-4 pt-3" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        
        {/* Native Mapbox Map Container */}
        <View className="w-full h-52 rounded-2xl overflow-hidden mb-5 border border-slate-800 relative bg-[#090D16] shadow-xl">
          <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Dark}
            zoomEnabled={false}
            scrollEnabled={false}
            pitchEnabled={false}
            attributionEnabled={false}
            logoEnabled={false}
            scaleBarEnabled={false}
          >
            <Mapbox.Camera
              zoomLevel={13.5}
              centerCoordinate={safeCoords}
              animationMode="flyTo"
              animationDuration={1000}
            />

            {/* 📍 CUSTOM DESTINATION MARKERVIEW */}
            <Mapbox.MarkerView id="destinationPin" coordinate={safeCoords}>
              <View style={styles.destinationPinContainer}>
                <Image 
                  source={require('../../assets/location.png')} 
                  style={styles.pinImageIcon} 
                  resizeMode="contain" 
                />
              </View>
            </Mapbox.MarkerView>

            {/* 🚲🚗 DYNAMIC NEARBY VEHICLE MARKERVIEWS */}
            {nearbyVehicles.map((vehicle) => (
              <Mapbox.MarkerView key={vehicle.id} id={vehicle.id} coordinate={vehicle.coords}>
                <View style={styles.vehiclePinContainer}>
                  <Image 
                    source={vehicle.image} 
                    style={styles.vehicleImageIcon} 
                    resizeMode="contain" 
                  />
                </View>
              </Mapbox.MarkerView>
            ))}
          </Mapbox.MapView>
          
          {/* Floating Rider Count Overlay Badge */}
          <View className="absolute bottom-3 left-3 bg-slate-900/90 px-3.5 py-2 rounded-full border border-slate-700/80 flex-row items-center space-x-2 shadow-lg">
            <Ionicons name="bicycle" size={20} color="#00D2D2" />
            <Text className="text-white text-xs font-bold ml-1">
              2 nearby riders & drivers
            </Text>
            <View className="w-2 h-2 rounded-full bg-emerald-400 ml-1 animate-pulse" />
          </View>
        </View>

        {/* Primary Service Buttons */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity 
            className="flex-1 bg-rose-600 p-4 rounded-2xl justify-between h-36 shadow-lg" 
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PackageDelivery' as never)}
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="cube-outline" size={22} color="#FFFFFF" />
            </View>
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white font-bold text-base leading-tight">Package{'\n'}Delivery</Text>
                <Text className="text-white/80 text-[11px] mt-0.5">Send anything, anywhere</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

         <TouchableOpacity
            className="flex-1 bg-slate-800 border border-slate-700 p-4 rounded-2xl justify-between h-36 shadow-lg"
            activeOpacity={0.85}
            
            onPress={() => navigation.navigate("BuyForMe" as never)}
          >
            <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center">
              <Ionicons name="cart-outline" size={22} color="#00D2D2" />
            </View>
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white font-bold text-base leading-tight">Buy For Me</Text>
                <Text className="text-slate-400 text-[11px] mt-0.5">We shop, you relax</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>
      
        {/* Popular Markets Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold text-base">Popular Markets & Stores</Text>
            <TouchableOpacity onPress={() => setShowMarketSearch(true)}>
              <Text className="text-[#00D2D2] text-xs font-semibold">View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {POPULAR_MARKETS.map((market) => (
              <TouchableOpacity
                key={market.id}
                onPress={() => handleMarketSelect(market)}
                activeOpacity={0.85}
                className="w-56 bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 mr-3 shadow-md"
              >
                <View className="h-28 w-full relative">
                  <Image source={{ uri: market.image }} className="w-full h-full object-cover" />
                  
                  <View className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-md flex-row items-center">
                    <Ionicons name="location-outline" size={12} color="#00D2D2" />
                    <Text className="text-white text-[10px] font-bold ml-0.5">{market.distance}</Text>
                  </View>

                  <View className="absolute top-2 right-2 bg-amber-500/90 px-2 py-0.5 rounded-md flex-row items-center">
                    <Ionicons name="star" size={10} color="#FFFFFF" />
                    <Text className="text-white text-[10px] font-bold ml-0.5">{market.rating}</Text>
                  </View>
                </View>

                <View className="p-3">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>
                    {market.name}
                  </Text>
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-slate-400 text-xs">
                      {market.duration} • {market.location}
                    </Text>
                    <Ionicons name="navigate-circle-outline" size={18} color="#00D2D2" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Purchases Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold text-base">Recent Purchases</Text>
            <TouchableOpacity>
              <Text className="text-[#00D2D2] text-xs font-semibold">View all</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between space-x-3 gap-2">
            <View className="flex-1 bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 shadow-sm">
              <View className="h-20 w-full relative">
                <Image source={{ uri: 'https://indomie.ng/wp-content/uploads/2020/04/indomie-new.png' }} className="w-full h-full object-cover" />
              </View>
              <View className="p-2.5">
                <Text className="text-white font-semibold text-xs" numberOfLines={1}>Indomie</Text>
                <Text className="text-[#00D2D2] text-xs mt-0.5 font-bold">₦1,200</Text>
              </View>
            </View>

            <View className="flex-1 bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 shadow-sm">
              <View className="h-20 w-full relative">
                <Image source={{ uri: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80' }} className="w-full h-full object-cover" />
              </View>
              <View className="p-2.5">
                <Text className="text-white font-semibold text-xs" numberOfLines={1}>Peak Milk</Text>
                <Text className="text-[#00D2D2] text-xs mt-0.5 font-bold">₦1,850</Text>
              </View>
            </View>

            <View className="flex-1 bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 shadow-sm">
              <View className="h-20 w-full relative">
                <Image source={{ uri: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80' }} className="w-full h-full object-cover" />
              </View>
              <View className="p-2.5">
                <Text className="text-white font-semibold text-xs" numberOfLines={1}>Tomatoes</Text>
                <Text className="text-[#00D2D2] text-xs mt-0.5 font-bold">₦1,500</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  destinationPinContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#090D16',
    borderWidth: 2,
    borderColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
  },
  pinImageIcon: {
    width: 22,
    height: 22,
  },
  vehiclePinContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#090D16',
    borderWidth: 2,
    borderColor: '#00D2D2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  vehicleImageIcon: {
    width: 20,
    height: 20,
  },
});