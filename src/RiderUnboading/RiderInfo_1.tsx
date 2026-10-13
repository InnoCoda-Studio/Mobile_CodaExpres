import React, { useState } from "react";
import { Alert, ActivityIndicator } from 'react-native';
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,

  Image,
  TextInput,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RiderInfoData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  residential_address: string;
}

interface RiderInfoProp {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  onBack: () => void;
  onNext: (data: RiderInfoData) => void;
}

export default function RiderInfo_1({
  firstName: initialFirstName,
  lastName: initialLastName,
  phoneNumber,
  email: initialEmail,
  onBack,
  onNext,
}: RiderInfoProp) {



  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [address, setAddress] = useState("");
  
  // Dropdown visibility state
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isLocating, setIsLocating] = useState(false);




const handleDetectLocation = async () => {
  try {
    setIsLocating(true);
    
    // 1. Check existing permission status first
    let { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    // 2. If not granted, try requesting it
    if (status !== 'granted') {
      const permissionResult = await Location.requestForegroundPermissionsAsync();
      status = permissionResult.status;
      canAskAgain = permissionResult.canAskAgain;
    }

    // 3. Handle denial
    if (status !== 'granted') {
      if (!canAskAgain) {
        // User clicked "Don't ask again" or cancelled multiple times
        Alert.alert(
          "Location Permission Required",
          "Location access is permanently disabled for CodaExpress. Please open your device settings to enable location permissions.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        Alert.alert("Permission Denied", "Please allow location access to auto-detect your address.");
      }
      setIsLocating(false);
      return;
    }

    // 4. If granted, fetch GPS coordinates
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      let place = reverseGeocode[0];
      let formattedAddress = `${place.street || ''}, ${place.subregion || place.district || ''}, ${place.city || 'Lagos'}`.replace(/^,\s/, '');
      setAddress(formattedAddress.trim());
    } else {
      Alert.alert("Error", "Could not determine exact address. Please type it manually.");
    }
  } catch (error) {
    console.error("Location error:", error);
    Alert.alert("Error", "Failed to fetch location. Please check your GPS settings.");
  } finally {
    setIsLocating(false);
  }
};




  const handleContinue = () => {
    // Validation check
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !address.trim()) {
      setErrorMessage("Please ensure all fields are filled out correctly.");
      return;
    }

    setErrorMessage("");
    onNext({
      firstName,
      lastName,
      phone: phoneNumber,
      email,
      residential_address: address,
    });
  };


  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <View className="h-[105px] flex-row items-center justify-center relative">
          <TouchableOpacity
            onPress={onBack}
            className="absolute left-5 top-7 w-12 h-12 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={30} color="#001F3F" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Image
              source={require("../../assets/codaexpress-logo.png")}
              className="w-[42px] h-[42px]"
              resizeMode="contain"
            />
            <Text className="text-[#001F3F] text-[22px] font-extrabold ml-1">
              Coda<Text className="text-[#FF4D6D]">Express</Text>
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-7">
          <Text className="text-[28px] leading-[36px] font-black text-[#001F3F]">
            Your Information
          </Text>

          <Text className="text-[16px] leading-[23px] font-medium text-[#91A9C1] mt-2">
            Confirm your signup details. Edit if anything is incorrect.
          </Text>

          {errorMessage ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <Text className="text-red-600 text-sm font-medium">{errorMessage}</Text>
            </View>
          ) : null}

          {/* First Name */}
          <View className="mt-5">
            <Text className="text-[14px] font-semibold text-[#91A9C1] mb-2">
              First Name
            </Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#91A9C1"
              className="h-[52px] w-full rounded-[10px] border border-[#DCEAF2] bg-white px-4 text-[15px] text-[#001F3F]"
            />
          </View>

          {/* Last Name */}
          <View className="mt-5">
            <Text className="text-[14px] font-semibold text-[#91A9C1] mb-2">
              Last Name
            </Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#91A9C1"
              className="h-[52px] w-full rounded-[10px] border border-[#DCEAF2] bg-white px-4 text-[15px] text-[#001F3F]"
            />
          </View>

          {/* Phone Number (Locked & Unchangeable) */}
          <View className="mt-5">
            <Text className="text-[14px] font-semibold text-[#91A9C1] mb-2">
              Phone Number (Verified)
            </Text>
            <View className="h-[52px] w-full rounded-[10px] border border-[#DCEAF2] bg-gray-100 flex-row items-center px-4">
              <TextInput
                value={phoneNumber}
                editable={false} // Unchangeable
                className="flex-1 text-[15px] text-gray-500"
              />
              <View className="bg-[#12C86B] rounded-full px-3 py-1.5">
                <Text className="text-white text-[11px] font-bold">Verified</Text>
              </View>
            </View>
          </View>

          {/* Email */}
          <View className="mt-5">
            <Text className="text-[14px] font-semibold text-[#91A9C1] mb-2">
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              placeholderTextColor="#91A9C1"
              className="h-[52px] w-full rounded-[10px] border border-[#DCEAF2] bg-white px-4 text-[15px] text-[#001F3F]"
            />
          </View>

          {/* Residential Address Dropdown */}
         {/* Residential Address */}
<View className="mt-5">
  <View className="flex-row justify-between items-center mb-2">
    <Text className="text-[14px] font-semibold text-[#91A9C1]">
      Residential Address <Text className="text-red-500">*</Text>
    </Text>
    
    {/* GPS Auto-Detect Button */}
    <TouchableOpacity 
      onPress={handleDetectLocation}
      className="flex-row items-center bg-[#EDF5FA] px-2.5 py-1 rounded-md"
    >
      {isLocating ? (
        <ActivityIndicator size="small" color="#2587C8" />
      ) : (
        <>
          <Ionicons name="locate" size={14} color="#2587C8" />
          <Text className="text-[#2587C8] text-xs font-bold ml-1">Auto-Detect</Text>
        </>
      )}
    </TouchableOpacity>
  </View>

  <View className="h-[52px] w-full rounded-[10px] border border-[#DCEAF2] bg-white flex-row items-center px-4">
    <TextInput
      value={address}
      onChangeText={setAddress}
      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
      placeholderTextColor="#91A9C1"
      className="flex-1 text-[15px] text-[#001F3F]"
    />

    <Ionicons
      name="location-outline"
      size={22}
      color="#2587C8"
    />
  </View>
</View>
          {/* Dropdown Modal */}
          {/* <Modal
            visible={isDropdownVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsDropdownVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setIsDropdownVisible(false)}
              className="flex-1 bg-black/50 justify-center px-6"
            >
              <View className="bg-white rounded-2xl p-4 max-h-[400px]">
                <Text className="text-lg font-bold text-[#001F3F] mb-3 px-2">
                  Select Residential Area
                </Text>
                <FlatList
                  data={LAGOS_AREAS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setAddress(item);
                        setIsDropdownVisible(false);
                      }}
                      className="py-3 px-3 border-b border-gray-100 flex-row items-center justify-between"
                    >
                      <Text className="text-[15px] text-[#001F3F] font-medium">{item}</Text>
                      {address === item && (
                        <Ionicons name="checkmark" size={18} color="#00C2D1" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal> */}

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            className="h-[52px] w-full rounded-[10px] bg-[#00C2D1] mt-8 items-center justify-center flex-row"
          >
            <Text className="text-white text-[16px] font-bold">Continue</Text>
            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}