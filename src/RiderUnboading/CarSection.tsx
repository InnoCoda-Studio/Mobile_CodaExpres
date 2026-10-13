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

interface CarSectionProps {
  onBack: () => void;
  onNext: () => void;
}

const CAR_MAKES = ["Toyota", "Honda", "Hyundai", "Kia", "Nissan", "Lexus", "Mercedes-Benz", "Other"];
const CAR_MODELS = ["Corolla", "Camry", "Elantra", "Rio", "Civic", "Almera", "ES 350", "Other"];
const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "Other"];
const COLOURS = ["White", "Black", "Silver / Grey", "Blue", "Red", "Gold", "Dark Blue","Other"];

export default function CarSection({
  onBack,
  onNext,
}: CarSectionProps) {
  const [plateNumber, setPlateNumber] = useState("");
  const [make, setMake] = useState("Select make");
  const [model, setModel] = useState("Select model");
  const [year, setYear] = useState("Select year");
  const [colour, setColour] = useState("Select colour");

  const [vehiclePhotoUri, setVehiclePhotoUri] = useState("");
  const [licenseUri, setLicenseUri] = useState("");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved drafts on mount
  useEffect(() => {
    (async () => {
      try {
        const savedPlate = await AsyncStorage.getItem("draft_car_plate");
        const savedMake = await AsyncStorage.getItem("draft_car_make");
        const savedModel = await AsyncStorage.getItem("draft_car_model");
        const savedYear = await AsyncStorage.getItem("draft_car_year");
        const savedColour = await AsyncStorage.getItem("draft_car_colour");
        const savedPhoto = await AsyncStorage.getItem("draft_car_photo");
        const savedLicense = await AsyncStorage.getItem("draft_car_license");

        if (savedPlate) setPlateNumber(savedPlate);
        if (savedMake) setMake(savedMake);
        if (savedModel) setModel(savedModel);
        if (savedYear) setYear(savedYear);
        if (savedColour) setColour(savedColour);
        if (savedPhoto) setVehiclePhotoUri(savedPhoto);
        if (savedLicense) setLicenseUri(savedLicense);
      } catch (e) {
        console.error("Failed to load car drafts", e);
      }
    })();
  }, []);

  const handlePlateChange = (text: string) => {
    const formatted = text.toUpperCase();
    setPlateNumber(formatted);
    AsyncStorage.setItem("draft_car_plate", formatted).catch(() => {});
  };

  const handleSelect = (field: string, value: string) => {
    if (field === "make") { setMake(value); AsyncStorage.setItem("draft_car_make", value); }
    if (field === "model") { setModel(value); AsyncStorage.setItem("draft_car_model", value); }
    if (field === "year") { setYear(value); AsyncStorage.setItem("draft_car_year", value); }
    if (field === "colour") { setColour(value); AsyncStorage.setItem("draft_car_colour", value); }
    setOpenDropdown(null);
  };

  const pickImage = async (type: "vehicle" | "license") => {
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
            "Camera access is required to capture documents.",
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
          await AsyncStorage.setItem("draft_car_photo", uri);
        } else {
          setLicenseUri(uri);
          await AsyncStorage.setItem("draft_car_license", uri);
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Could not capture photo.");
    }
  };

  const handleContinue = async () => {
    if (!plateNumber.trim()) {
      setErrorMessage("Please enter your vehicle plate number.");
      return;
    }
    if (make === "Select make" || model === "Select model" || year === "Select year" || colour === "Select colour") {
      setErrorMessage("Please complete all car details.");
      return;
    }
    if (!vehiclePhotoUri) {
      setErrorMessage("Please capture a photo of your car.");
      return;
    }
    if (!licenseUri) {
      setErrorMessage("Please upload your Driver's License.");
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

    // Vehicle photo
    if (vehiclePhotoUri && !vehiclePhotoUri.startsWith("http")) {
      const filename = vehiclePhotoUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("vehicle_photo", {
        uri: vehiclePhotoUri,
        name: filename || "car_photo.jpg",
        type,
      } as any);
    }

    // Driver's license
    if (licenseUri && !licenseUri.startsWith("http")) {
      const filename = licenseUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("driver_license", {
        uri: licenseUri,
        name: filename || "driver_license.jpg",
        type,
      } as any);
    }

    try {
      await axiosInstance.patch("/auth/riders/onboarding/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await AsyncStorage.multiRemove([
        "draft_car_plate",
        "draft_car_make",
        "draft_car_model",
        "draft_car_year",
        "draft_car_colour",
        "draft_car_photo",
        "draft_car_license",
      ]);

      onNext();
    } catch (error: any) {
      console.error("Car section error:", error);
      const apiMsg = error.response?.data?.error || error.response?.data?.detail;
      setErrorMessage(apiMsg || "Failed to save car details. Please check your connection.");
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

        {/* PROGRESS INDICATOR */}
        <View className="flex-row items-center justify-center mb-5">
          <View className="w-[9px] h-[9px] rounded-full bg-[#00C2D1]" />
          <View className="w-[38px] h-[2px] bg-[#D8EEF2]" />
          <View className="w-[7px] h-[7px] rounded-full bg-[#D8EEF2]" />
          <View className="w-[38px] h-[2px] bg-[#D8EEF2]" />
          <View className="w-[7px] h-[7px] rounded-full bg-[#D8EEF2]" />
        </View>

        {/* MAIN CONTENT */}
        <View className="px-5">
          <Text className="text-[21px] leading-[28px] font-black text-[#001F3F]">
            Car Information
          </Text>

          <Text className="text-[13px] leading-[20px] font-medium text-[#91A9C1] mt-1 mb-4">
            Provide details about your car{"\n"}and upload required documents.
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
              placeholder="e.g. LAG 12SXY"
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
            <DropdownList items={CAR_MAKES} onSelect={(item) => handleSelect("make", item)} />
          )}

          {/* MODEL */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1 mt-3">Model <Text className="text-[#FF4D6D]">*</Text></Text>
          <DropdownField
            value={model}
            isOpen={openDropdown === "model"}
            onPress={() => setOpenDropdown(openDropdown === "model" ? null : "model")}
          />
          {openDropdown === "model" && (
            <DropdownList items={CAR_MODELS} onSelect={(item) => handleSelect("model", item)} />
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
                <Text className="text-[9px] text-[#91A9C1]">Ensure full car and plate are visible</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* UPLOAD DRIVER'S LICENSE */}
          <Text className="text-[13px] font-medium text-[#66829B] mb-1">
            Upload Driver's License <Text className="text-[#FF4D6D]">*</Text>
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => pickImage("license")}
            className="h-[95px] w-full rounded-[7px] border-2 border-dashed border-[#C9E1EB] bg-white items-center justify-center overflow-hidden"
          >
            {licenseUri ? (
              <Image source={{ uri: licenseUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <MaterialCommunityIcons name="card-account-details-outline" size={25} color="#00C2D1" />
                <Text className="text-[10px] text-[#001F3F] font-bold mt-1">Tap to snap Driver's License</Text>
                <Text className="text-[9px] text-[#91A9C1]">Ensure license details are clear</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* CONTINUE BUTTON */}
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