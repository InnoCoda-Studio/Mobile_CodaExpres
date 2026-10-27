import React, { useState, useEffect } from "react";
import axios from "axios";
import apiClient from "../api/client";
import * as ImagePicker from "expo-image-picker";


import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PasswordInput from "../components/PasswordInput";
interface CustomerSignupProps {
  phoneNumber: string;
  onBack: () => void;
  onLogin: () => void;
}

export default function CustomerSignupScreen({
  phoneNumber,
  onBack,
  onLogin,
}: CustomerSignupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [signupError, setSignupError] = useState("");




  // Handle Profile Image Selection
  const handleProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo Permission Required",
        "Please allow CodaExpress to access your photos so you can choose a profile picture.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Handle Customer Signup
  const handleCustomerSignup = async () => {
    // Clear all existing error states
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSignupError("");

    let hasError = false;

    // First name validation
    if (!firstName.trim()) {
      setFirstNameError("First name is required.");
      hasError = true;
    }

    // Last name validation
    if (!lastName.trim()) {
      setLastNameError("Last name is required.");
      hasError = true;
    }

    // Email validation
    if (!email.trim()) {
      setEmailError("Email address is required.");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError("Please enter a valid email address.");
        hasError = true;
      }
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      hasError = true;
    }

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("phone_number", phoneNumber);
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("role", "CUSTOMER");

      if (profileImage) {
        formData.append("profile_picture", {
          uri: profileImage,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await apiClient.post("/auth/register/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("REGISTER SUCCESS:", response.data);

      // Alert user of successful registration and direct them to Login
      Alert.alert(
        "Account Created!",
        "Your customer account has been created successfully.",
        [
          {
            text: "Continue to Login",
            onPress: () => onLogin(),
          },
        ]
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        console.log("REGISTER ERROR:", data);

        if (data) {
          const parseMsg = (field: any) =>
            Array.isArray(field) ? field[0] : field;

          if (data.first_name) setFirstNameError(parseMsg(data.first_name));
          if (data.last_name) setLastNameError(parseMsg(data.last_name));
          if (data.email) setEmailError(parseMsg(data.email));
          if (data.password) setPasswordError(parseMsg(data.password));

          if (data.phone_number) {
            setSignupError(`Phone Number: ${parseMsg(data.phone_number)}`);
          } else if (data.detail || data.message || data.non_field_errors) {
            setSignupError(
              parseMsg(data.detail || data.message || data.non_field_errors)
            );
          } else if (
            !data.first_name &&
            !data.last_name &&
            !data.email &&
            !data.password
          ) {
            setSignupError("Registration failed. Please check your details.");
          }
        } else {
          setSignupError("Unable to connect to server. Please check network.");
        }
      } else {
        setSignupError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Social Auth Handlers
  // const handleGoogleAuth = async () => {
  //   try {
  //     setIsLoading(true);
  //     await GoogleSignin.hasPlayServices();
      
  //     // 1. Get real Google token
  //     const googleRes = await GoogleSignin.signIn();
  //     const idToken = googleRes.data?.idToken;

  //     if (!idToken) throw new Error("No ID Token received");

  //     // 2. Post to Django
  //     const response = await apiClient.post("/auth/google/", { id_token: idToken });
      
  //     console.log("SUCCESS:", response.data);
  //     // TODO: save tokens or navigate here
  //   } catch (error: any) {
  //     console.log("GOOGLE AUTH ERROR:", error.response?.data || error.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

// const handleFacebookAuth = async (accessToken: string) => {
//   try {
//     setIsLoading(true);
//     const response = await apiClient.post("/auth/facebook/", {
//       access_token: accessToken,
//     });
//     console.log("FACEBOOK BACKEND SUCCESS:", response.data);
//     // Token handling will go here
//   } catch (error) {
//     setSignupError("Facebook Authentication failed. Please try again.");
//   } finally {
//     setIsLoading(false);
//   }
// };


  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-14">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={28} color="#001F3F" />
          </TouchableOpacity>

          <View className="flex-1 items-center mr-10">
            <View className="flex-row items-center">
              <Image
                source={require("../../assets/codaexpress-logo.png")}
                className="w-11 h-11"
                resizeMode="contain"
              />
              <Text className="text-dark text-2xl font-black ml-1">
                Coda<Text className="text-brand">Express</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Illustration */}
        <View className="items-center mt-5">
          <Image
            source={require("../../assets/01_customer_signup_illustration.png")}
            className="w-80 h-56"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View className="px-5 mt-1">
          <Text className="text-dark text-4xl font-black leading-tight">
            Create Your{"\n"}Customer Account
          </Text>

          <Text className="text-[#4D78A3] text-base mt-3 leading-6">
            Tell us a little about yourself. You’re just{"\n"}a few steps away.
          </Text>
        </View>

        {/* First Name */}
        <View className="mx-5 mt-8 border border-[#DCE7F0] rounded-2xl px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#EDF5FA] items-center justify-center mr-3">
              <Ionicons name="person" size={21} color="#5B82A5" />
            </View>

            <View className="flex-1">
              <Text className="text-dark font-medium">
                First Name <Text className="text-brand">*</Text>
              </Text>

              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#91A9C1"
                className="text-[#001F3F] text-base mt-1 p-0"
              />
              {firstNameError ? (
                <Text className="text-red-500 text-sm mt-2">
                  {firstNameError}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Last Name */}
        <View className="mx-5 mt-5 border border-[#DCE7F0] rounded-2xl px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#EDF5FA] items-center justify-center mr-3">
              <Ionicons name="person" size={21} color="#5B82A5" />
            </View>

            <View className="flex-1">
              <Text className="text-dark font-medium">
                Last Name <Text className="text-brand">*</Text>
              </Text>

              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#91A9C1"
                className="text-[#001F3F] text-base mt-1 p-0"
              />
              {lastNameError ? (
                <Text className="text-red-500 text-sm mt-2">
                  {lastNameError}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Email */}
        <View className="mx-5 mt-5 border border-[#DCE7F0] rounded-2xl px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#EDF5FA] items-center justify-center mr-3">
              <Ionicons name="mail-outline" size={21} color="#5B82A5" />
            </View>

            <View className="flex-1">
              <Text className="text-dark font-medium">
                Email Address <Text className="text-brand">*</Text>
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#91A9C1"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-[#001F3F] text-base mt-1 p-0"
              />

              {emailError ? (
                <Text className="text-red-500 text-sm mt-2">{emailError}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Password */}
        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          error={passwordError}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          error={confirmPasswordError}
        />

        {/* Profile Photo */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="mx-5 mt-5 border border-[#DCE7F0] rounded-2xl px-4 py-4"
          onPress={handleProfileImage}
        >
          <Text className="text-dark font-medium mb-4">
            Profile Photo <Text className="text-[#91A9C1]">(Optional)</Text>
          </Text>

          <View className="flex-row items-center">
            <View className="w-24 h-24 rounded-full border-2 border-dashed border-[#C9DCEB] items-center justify-center">
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-[#EDF5FA] items-center justify-center">
                  <Ionicons name="camera" size={25} color="#5B82A5" />
                </View>
              )}
            </View>

            <View className="ml-5">
              <Text className="text-[#5B82A5] font-medium">
                Add a profile photo
              </Text>

              <Text className="text-[#91A9C1] text-sm mt-1">
                JPG, PNG (Max 2MB)
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Global Error Notice */}
        {signupError ? (
          <View className="mx-5 mt-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <Text className="text-red-600 text-sm">{signupError}</Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCustomerSignup}
          disabled={isLoading}
          className="mx-5 mt-8 bg-brand py-4 rounded-xl items-center justify-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-bold">Continue</Text>

              <Ionicons
                name="arrow-forward"
                size={21}
                color="white"
                style={{ marginLeft: 10 }}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Log In Redirect */}
        <View className="flex-row justify-center mt-5">
          <Text className="text-[#4D78A3] text-base">
            Already have an account?{" "}
          </Text>

          <TouchableOpacity onPress={onLogin}>
            <Text className="text-brand font-bold text-base">Log in</Text>
          </TouchableOpacity>
        </View>

        {/* Social Dividers */}
        <View className="flex-row items-center mx-5 mt-7">
          <View className="flex-1 h-[1px] bg-[#DCE7F0]" />
          <Text className="mx-4 text-[#4D78A3]">Or continue with</Text>
          <View className="flex-1 h-[1px] bg-[#DCE7F0]" />
        </View>

        {/* Google */}
        <TouchableOpacity className="mx-5 mt-5 border border-[#DCE7F0] rounded-xl py-4 items-center"
          // onPress={handleGoogleAuth}
        >
          <View className="flex-row items-center">
            <Image
              className="w-10 h-10 mr-10"
              source={require("../../assets/google-logo.jpg")}
            />
            <Text className="text-dark font-medium">Continue with Google</Text>
          </View>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity className="mx-5 mt-3 border border-[#DCE7F0] rounded-xl py-4 items-center"
          // onPress={() => handleFacebookAuth("MOCK_OR_REAL_ACCESS_TOKEN")}
        >
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-[#1877F2] items-center justify-center mr-4">
              <Text className="text-white text-2xl font-black">f</Text>
            </View>

            <Text className="text-dark font-medium text-base">
              Continue with Facebook
            </Text>
          </View>
        </TouchableOpacity>

        {/* Security Footer */}
        <View className="flex-row mx-8 mt-10">
          <Ionicons name="shield-checkmark" size={19} color="#5B82A5" />

          <Text className="text-[#5B82A5] text-sm leading-5 ml-2 flex-1">
            Your information is secure and will only be used to create your
            CodaExpress account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}