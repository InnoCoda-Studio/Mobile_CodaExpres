import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import apiClient from "../api/client"; // Adjust path if needed

interface LoginProps {
  phoneNumber?: string;
  onBack: () => void;
onLogin: (role: string) => void; // Called on successful login to navigate home
  onSignUp: () => void;
  onForgotPassword: () => void;
}

export default function Login({
  onBack,
  onLogin,
  onSignUp,
  onForgotPassword,
}: LoginProps): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Check if email was saved from a previous "Remember me" session
  useEffect(() => {
    const loadSavedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem("saved_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    };
    loadSavedEmail();
  }, []);

  const handleLoginSubmit = async () => {
    setLoginError("");

    if (!email.trim() || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        email: email.trim().toLowerCase(),
        password: password,
      };

      const response = await apiClient.post("/auth/login/", payload);

      if (response.data.access && response.data.refresh) {
        const userRole = response.data.user?.role || "CUSTOMER";

        // Save JWT tokens and user role locally
        await AsyncStorage.setItem("access_token", response.data.access);
        await AsyncStorage.setItem("refresh_token", response.data.refresh);
        await AsyncStorage.setItem("user_role", userRole);

        // Handle "Remember me" email saving
        if (rememberMe) {
          await AsyncStorage.setItem("saved_email", email.trim().toLowerCase());
        } else {
          await AsyncStorage.removeItem("saved_email");
        }

        console.log(`Login successful as [${userRole}]`);

        // Trigger navigation callback
        onLogin(userRole)
      } else {
        setLoginError("Invalid response from server. Please try again.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data?.detail) {
          setLoginError(data.detail);
        } else if (data?.non_field_errors) {
          setLoginError(data.non_field_errors[0]);
        } else {
          setLoginError("Invalid credentials. Please check and try again.");
        }
      } else {
        setLoginError("Network error. Please check your server connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialPlaceholder = (provider: string) => {
    Alert.alert(
      `${provider} Sign-In`,
      `${provider} login is reserved for web authentication. Please log in using your email or phone.`
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        {/* ================= HEADER ================= */}
        <View className="px-5 pt-12">
          <View className="flex-row items-center justify-between">
            {/* BACK BUTTON */}
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={27} color="#001F3F" />
            </TouchableOpacity>

            {/* LOGO */}
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

            {/* EMPTY SPACE FOR CENTERING */}
            <View className="w-10 h-10" />
          </View>
        </View>

        {/* ================= HERO ================= */}
        <View className="px-5 mt-8">
          <View className="flex-row items-center">
            {/* TITLE */}
            <View className="flex-1 pr-2">
              <Text className="text-dark text-4xl font-black leading-tight">
                Welcome{"\n"}Back
              </Text>
              <Text className="text-brand text-4xl font-black leading-tight">
                CodaExpress
              </Text>
            </View>

            {/* RIDER ILLUSTRATION */}
            <View className="w-32 h-40 items-center justify-center">
              <Image
                source={require("../../assets/CodaExpress_login_rider_illustration.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* DESCRIPTION */}
          <Text className="text-[#4D78A3] text-base mt-3 leading-6">
            Log in to your account and keep your{"\n"}
            deliveries moving.
          </Text>
        </View>

        {/* ================= EMAIL ================= */}
        <View className="mx-5 mt-8 border border-[#DCE7F0] rounded-2xl px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#EDF5FA] items-center justify-center mr-3">
              <Ionicons name="mail-outline" size={21} color="#5B82A5" />
            </View>
            <View className="flex-1">
              <Text className="text-dark font-medium">
                Email Address<Text className="text-brand"> *</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#91A9C1"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                className="text-[#001F3F] text-base mt-1 p-0"
              />
            </View>
          </View>
        </View>

        {/* ================= PASSWORD ================= */}
        <View className="mx-5 mt-5 border border-[#DCE7F0] rounded-2xl px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#EDF5FA] items-center justify-center mr-3">
              <Ionicons name="lock-closed-outline" size={21} color="#5B82A5" />
            </View>
            <View className="flex-1">
              <Text className="text-dark font-medium">
                Password<Text className="text-brand"> *</Text>
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#91A9C1"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                className="text-[#001F3F] text-base mt-1 p-0"
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              className="ml-2"
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={23}
                color="#5B82A5"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= REMEMBER / FORGOT ================= */}
        <View className="mx-5 mt-5 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setRememberMe(!rememberMe)}
            className="flex-row items-center"
          >
            <View
              className={`w-6 h-6 rounded-md items-center justify-center ${
                rememberMe ? "bg-brand" : "bg-white border border-[#DCE7F0]"
              }`}
            >
              {rememberMe && (
                <Ionicons name="checkmark" size={17} color="#FFFFFF" />
              )}
            </View>
            <Text className="text-[#4D78A3] text-sm ml-2">Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
            <Text className="text-brand text-sm font-bold">
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= API ERROR MESSAGE ================= */}
        {loginError ? (
          <View className="mx-5 mt-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <Text className="text-red-600 text-sm">{loginError}</Text>
          </View>
        ) : null}

        {/* ================= LOGIN BUTTON ================= */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLoginSubmit}
          disabled={isLoading}
          className="mx-5 mt-8 bg-brand py-4 rounded-xl items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-bold">Log In</Text>
              <Ionicons
                name="arrow-forward"
                size={21}
                color="white"
                style={{ marginLeft: 10 }}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* ================= DIVIDER ================= */}
        <View className="flex-row items-center mx-5 mt-7">
          <View className="flex-1 h-[1px] bg-[#DCE7F0]" />
          <Text className="mx-4 text-[#4D78A3]">Or continue with</Text>
          <View className="flex-1 h-[1px] bg-[#DCE7F0]" />
        </View>

        {/* ================= GOOGLE ================= */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSocialPlaceholder("Google")}
          className="mx-5 mt-5 border border-[#DCE7F0] rounded-xl py-4 items-center"
        >
          <View className="flex-row items-center">
            <Image
              className="w-10 h-10 mr-10"
              source={require("../../assets/google-logo.jpg")}
            />
            <Text className="text-dark font-medium">Continue with Google</Text>
          </View>
        </TouchableOpacity>

        {/* ================= FACEBOOK ================= */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSocialPlaceholder("Facebook")}
          className="mx-5 mt-3 border border-[#DCE7F0] rounded-xl py-4 items-center"
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

        {/* ================= SIGN UP ================= */}
        <View className="flex-row justify-center mt-5">
          <Text className="text-[#4D78A3] text-base">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
            <Text className="text-brand font-bold text-base">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* ================= SECURITY ================= */}
        <View className="flex-row mx-8 mt-10">
          <Ionicons name="shield-checkmark" size={19} color="#5B82A5" />
          <Text className="text-[#5B82A5] text-sm leading-5 ml-2 flex-1">
            Your information is secure and will only be used to access your
            CodaExpress account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}