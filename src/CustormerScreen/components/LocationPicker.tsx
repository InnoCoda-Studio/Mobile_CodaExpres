import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList , Linking} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface LocationPickerProps {
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
}

const POPULAR_LOCATIONS = [
  "Lekki Phase 1, Lagos",
  "Ajah Market, Lagos",
  "Victoria Island, Lagos",
  "Ikoyi, Lagos",
  "Ikeja City Mall, Lagos",
  "Yaba, Lagos",
];

export default function LocationPicker({ selectedLocation, onSelectLocation }: LocationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = POPULAR_LOCATIONS.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

 const detectCurrentLocation = async () => {
    try {
      // 1. Check existing permission status first
      let { status } = await Location.getForegroundPermissionsAsync();

      // 2. If not already granted, request it from the user
      if (status !== 'granted') {
        const response = await Location.requestForegroundPermissionsAsync();
        status = response.status;
      }

      // 3. If STILL denied, it's permanently blocked—guide them to settings!
      if (status !== 'granted') {
        alert(
          "Permission Denied",
          "Location permission is needed to detect your address. Please enable it in your phone settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() } // 👈 Opens device settings
          ]
        );
        return;
      }

      // 4. Happy Path: Permission granted, fetch coordinates & reverse geocode
      let location = await Location.getCurrentPositionAsync({});
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const current = `${address[0].name || address[0].street}, ${address[0].city || 'Lagos'}`;
        onSelectLocation(current);
        setModalVisible(false);
      }
    } catch (error) {
      alert('Could not fetch location automatically');
    }
  };
  return (
    <>
      {/* 🧭 Pill Button (Matches Image) */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center bg-darkBg border border-darkBorder px-4 py-3 rounded-full space-x-2 shadow-lg self-start "
      >
        <Ionicons name="location-outline" size={18} color="#f59e0b" />
        <Text className="text-white text-xs font-semibold">
          {selectedLocation || "Select Location"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#94A3B8" />
      </TouchableOpacity>

      {/* 🔽 Dropdown / Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-[#1E293B] rounded-t-3xl p-6 h-[60%]">
            
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900 dark:text-white">
                Select Location
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Type or Search */}
            <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl mb-3 border border-slate-200 dark:border-slate-700">
              <Ionicons name="search" size={18} color="#94A3B8" className="mr-2" />
              <TextInput
                placeholder="Type location manually..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => {
                  if (searchQuery) {
                    onSelectLocation(searchQuery);
                    setModalVisible(false);
                  }
                }}
                className="flex-1 text-slate-900 dark:text-white text-sm"
              />
            </View>

            {/* GPS Detection */}
            <TouchableOpacity
              onPress={detectCurrentLocation}
              className="flex-row items-center justify-center bg-amber-500/10 py-3 rounded-xl mb-4 border border-amber-500/30"
            >
              <Ionicons name="locate" size={16} color="#f59e0b" />
              <Text className="text-amber-500 font-semibold text-sm ml-2">
                Use Current Location
              </Text>
            </TouchableOpacity>

            {/* Popular Suggestions */}
            <FlatList
              data={filteredLocations}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelectLocation(item);
                    setModalVisible(false);
                  }}
                  className="py-3 border-b border-slate-100 dark:border-slate-800 flex-row items-center space-x-2"
                >
                  <Ionicons name="location-sharp" size={16} color="#94A3B8" />
                  <Text className="text-slate-700 dark:text-slate-200 text-sm">
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

          </View>
        </View>
      </Modal>
    </>
  );
}