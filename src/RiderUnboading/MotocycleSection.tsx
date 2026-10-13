import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/client"; // Adjust path to your axios instance

interface MotorcycleSectionProps {
  onBack: () => void;
  onNext: () => void;
}

const MAKES = ["Honda", "Bajaj", "TVS", "Yamaha", "Suzuki"];
const MODELS = ["CG 125", "Boxer 100", "HLX 125", "TVS Star"];
const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021"];
const COLOURS = ["Black", "Red", "Blue", "Silver / Grey", "Green"];

export default function MotorcycleSection({
  onBack,
  onNext,
}: MotorcycleSectionProps) {
  const [plateNumber, setPlateNumber] = useState("");
  const [make, setMake] = useState("Select make");
  const [model, setModel] = useState("Select model");
  const [year, setYear] = useState("Select year");
  const [colour, setColour] = useState("Select colour");
  
  const [vehiclePhotoUri, setVehiclePhotoUri] = useState("");
  const [riderCardUri, setRiderCardUri] = useState("");

  // Track which dropdown is currently open ('make' | 'model' | 'year' | 'colour' | null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved drafts on mount
  useEffect(() => {
    (async () => {
      try {
        const savedPlate = await AsyncStorage.getItem("draft_plate");
        const savedMake = await AsyncStorage.getItem("draft_make");
        const savedModel = await AsyncStorage.getItem("draft_model");
        const savedYear = await AsyncStorage.getItem("draft_year");
        const savedColour = await AsyncStorage.getItem("draft_colour");
        const savedPhoto = await AsyncStorage.getItem("draft_vehicle_photo");
        const savedCard = await AsyncStorage.getItem("draft_rider_card");

        if (savedPlate) setPlateNumber(savedPlate);
        if (savedMake) setMake(savedMake);
        if (savedModel) setModel(savedModel);
        if (savedYear) setYear(savedYear);
        if (savedColour) setColour(savedColour);
        if (savedPhoto) setVehiclePhotoUri(savedPhoto);
        if (savedCard) setRiderCardUri(savedCard);
      } catch (e) {
        console.error("Failed to load motorcycle drafts", e);
      }
    })();
  }, []);

  const handlePlateChange = (text: string) => {
    const formatted = text.toUpperCase();
    setPlateNumber(formatted);
    AsyncStorage.setItem("draft_plate", formatted).catch(() => {});
  };

  // Select value and close dropdown
  const handleSelect = (field: string, value: string) => {
    if (field === "make") { setMake(value); AsyncStorage.setItem("draft_make", value); }
    if (field === "model") { setModel(value); AsyncStorage.setItem("draft_model", value); }
    if (field === "year") { setYear(value); AsyncStorage.setItem("draft_year", value); }
    if (field === "colour") { setColour(value); AsyncStorage.setItem("draft_colour", value); }
    setOpenDropdown(null);
  };

  // Image Picker for Vehicle Photo & Rider ID
  const pickImage = async (type: "vehicle" | "card") => {
    try {
      let { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();

      if (status !== "granted") {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        status = permissionResult.status;
        canAskAgain = permissionResult.canAskAgain;
      }

      if (status !== "granted") {
        if (!canAskAgain) {
          Alert.alert(
            "Camera Permission Required",
            "Camera access is required to capture verification photos.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert("Permission Required", "Camera access is required.");
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (type === "vehicle") {
          setVehiclePhotoUri(uri);
          await AsyncStorage.setItem("draft_vehicle_photo", uri);
        } else {
          setRiderCardUri(uri);
          await AsyncStorage.setItem("draft_rider_card", uri);
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Could not capture photo.");
    }
  };

  // Submit Data to Django Backend
  const handleContinue = async () => {
    if (!plateNumber.trim()) {
      setErrorMessage("Please enter your vehicle plate number.");
      return;
    }
    if (make === "Select make" || model === "Select model" || year === "Select year" || colour === "Select colour") {
      setErrorMessage("Please complete all motorcycle details.");
      return;
    }
    if (!vehiclePhotoUri) {
      setErrorMessage("Please capture a photo of your motorcycle.");
      return;
    }
    if (!riderCardUri) {
      setErrorMessage("Please upload your Rider ID card.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("plate_number", plateNumber.trim());
    formData.append("vehicle_make", make);
    formData.append("vehicle_model", model);
    formData.append("vehicle_year", year);
    formData.append("vehicle_color", colour);

    // Append Vehicle Photo
    if (vehiclePhotoUri && !vehiclePhotoUri.startsWith("http")) {
      const filename = vehiclePhotoUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("vehicle_photo", {
        uri: vehiclePhotoUri,
        name: filename || "vehicle_photo.jpg",
        type,
      } as any);
    }

    // Append Rider ID Card
    if (riderCardUri && !riderCardUri.startsWith("http")) {
      const filename = riderCardUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("riders_card", {
        uri: riderCardUri,
        name: filename || "riders_card.jpg",
        type,
      } as any);
    }

    try {
      await axiosInstance.patch("/auth/riders/onboarding/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Clear drafts on success
      await AsyncStorage.multiRemove([
        "draft_plate",
        "draft_make",
        "draft_model",
        "draft_year",
        "draft_colour",
        "draft_vehicle_photo",
        "draft_rider_card",
      ]);

      onNext();
    } catch (error: any) {
      console.error("Motorcycle info error:", error);
      const apiMsg = error.response?.data?.error || error.response?.data?.detail;
      setErrorMessage(apiMsg || "Failed to save motorcycle details. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View className="h-[75px] flex-row items-center justify-center relative">
          <TouchableOpacity
            onPress={onBack}
            className="absolute left-4 top-3 w-12 h-12 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="#001F3F" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Image
              source={require("../../assets/codaexpress-logo.png")}
              className="w-[38px] h-[38px]"
              resizeMode="contain"
            />
            <Text className="text-[#001F3F] text-[19px] font-extrabold ml-1">
              Coda<Text className="text-[#FF4D6D]">Express</Text>
            </Text>
          </View>
        </View>

        {/* PROGRESS */}
        <View className="flex-row items-center justify-center mb-5">
          <View className="w-[7px] h-[7px] rounded-full bg-[#B8E8EC]" />
          <View className="w-[38px] h-[2px] bg-[#B8E8EC]" />
          <View className="w-[9px] h-[9px] rounded-full bg-[#00C2D1]" />
          <View className="w-[38px] h-[2px] bg-[#B8E8EC]" />
          <View className="w-[7px] h-[7px] rounded-full bg-[#B8E8EC]" />
          <View className="w-[7px] h-[7px] rounded-full bg-[#B8E8EC] ml-2" />
        </View>

        {/* CONTENT */}
        <View className="px-5">
          <Text className="text-[21px] leading-[28px] font-black text-[#001F3F]">
            Motorcycle Information
          </Text>

          <Text className="text-[13px] leading-[20px] font-medium text-[#91A9C1] mt-1 mb-4">
            Provide details about your motorcycle{"\n"}and upload required photos.
          </Text>

          {errorMessage ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-600 text-xs font-medium">{errorMessage}</Text>
            </View>
          ) : null}

          {/* PLATE NUMBER */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1">
            Plate Number <Text className="text-[#FF4D6D]">*</Text>
          </Text>
          <View className="h-[42px] w-full rounded-[7px] border border-[#DCEAF2] bg-white justify-center px-3 mb-3">
            <TextInput
              value={plateNumber}
              onChangeText={handlePlateChange}
              placeholder="e.g. LAG 2SXY"
              placeholderTextColor="#91A9C1"
              autoCapitalize="characters"
              className="text-[13px] text-[#001F3F] font-bold"
            />
          </View>

          {/* MAKE */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1">Make <Text className="text-[#FF4D6D]">*</Text></Text>
          <DropdownField
            value={make}
            isOpen={openDropdown === "make"}
            onPress={() => setOpenDropdown(openDropdown === "make" ? null : "make")}
          />
          {openDropdown === "make" && (
            <DropdownList items={MAKES} onSelect={(item) => handleSelect("make", item)} />
          )}

          {/* MODEL */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1 mt-3">Model <Text className="text-[#FF4D6D]">*</Text></Text>
          <DropdownField
            value={model}
            isOpen={openDropdown === "model"}
            onPress={() => setOpenDropdown(openDropdown === "model" ? null : "model")}
          />
          {openDropdown === "model" && (
            <DropdownList items={MODELS} onSelect={(item) => handleSelect("model", item)} />
          )}

          {/* YEAR */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1 mt-3">Year <Text className="text-[#FF4D6D]">*</Text></Text>
          <DropdownField
            value={year}
            isOpen={openDropdown === "year"}
            onPress={() => setOpenDropdown(openDropdown === "year" ? null : "year")}
          />
          {openDropdown === "year" && (
            <DropdownList items={YEARS} onSelect={(item) => handleSelect("year", item)} />
          )}

          {/* COLOUR */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1 mt-3">Colour <Text className="text-[#FF4D6D]">*</Text></Text>
          <DropdownField
            value={colour}
            isOpen={openDropdown === "colour"}
            onPress={() => setOpenDropdown(openDropdown === "colour" ? null : "colour")}
          />
          {openDropdown === "colour" && (
            <DropdownList items={COLOURS} onSelect={(item) => handleSelect("colour", item)} />
          )}

          {/* UPLOAD VEHICLE PHOTO */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1 mt-4">
            Upload Vehicle Photo <Text className="text-[#FF4D6D]">*</Text>
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => pickImage("vehicle")}
            className="h-[95px] w-full rounded-[7px] border-2 border-dashed border-[#C9E1EB] bg-white items-center justify-center overflow-hidden mb-3"
          >
            {vehiclePhotoUri ? (
              <Image source={{ uri: vehiclePhotoUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <MaterialCommunityIcons name="camera-outline" size={25} color="#12618A" />
                <Text className="text-[10px] text-[#001F3F] font-bold mt-1">Tap to take vehicle photo</Text>
                <Text className="text-[9px] text-[#91A9C1]">Ensure entire bike is visible</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* UPLOAD RIDER ID CARD */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1">
            Upload Rider ID Card <Text className="text-[#FF4D6D]">*</Text>
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => pickImage("card")}
            className="h-[95px] w-full rounded-[7px] border-2 border-dashed border-[#C9E1EB] bg-white items-center justify-center overflow-hidden"
          >
            {riderCardUri ? (
              <Image source={{ uri: riderCardUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <MaterialCommunityIcons name="card-account-details-outline" size={25} color="#00C2D1" />
                <Text className="text-[10px] text-[#001F3F] font-bold mt-1">Tap to snap Rider ID</Text>
                <Text className="text-[9px] text-[#91A9C1]">Company or association card</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* CONTINUE */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isSubmitting}
            activeOpacity={0.8}
            className="h-[43px] w-full rounded-[7px] bg-[#00C2D1] mt-6 items-center justify-center flex-row"
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text className="text-white text-[13px] font-bold ml-2">Saving...</Text>
              </View>
            ) : (
              <>
                <Text className="text-white text-[13px] font-bold">Continue</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" style={{ marginLeft: 7 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DropdownFieldProps {
  value: string;
  isOpen: boolean;
  onPress: () => void;
}

function DropdownField({ value, isOpen, onPress }: DropdownFieldProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="h-[42px] w-full rounded-[7px] border border-[#DCEAF2] bg-white flex-row items-center justify-between px-3"
    >
      <Text className={`text-[13px] ${value.startsWith("Select") ? "text-[#91A9C1]" : "text-[#001F3F] font-semibold"}`}>
        {value}
      </Text>
      <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={17} color="#4F7188" />
    </TouchableOpacity>
  );
}

interface DropdownListProps {
  items: string[];
  onSelect: (item: string) => void;
}

function DropdownList({ items, onSelect }: DropdownListProps) {
  return (
    <View className="w-full bg-white border border-[#DCEAF2] rounded-[7px] mt-1 overflow-hidden shadow-sm">
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelect(item)}
          className="py-2.5 px-3 border-b border-[#F0F5F8]"
        >
          <Text className="text-[13px] text-[#001F3F] font-medium">{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}