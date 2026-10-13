import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder = "Enter your password",
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mx-5 mt-5">

      {/* INPUT CARD */}
      <View
        className={`border rounded-2xl px-4 py-3 ${
          error
            ? "border-red-400"
            : "border-[#DCE7F0]"
        }`}
      >
        <View className="flex-row items-center">

          {/* LOCK ICON */}
          <View className="w-10 h-10 rounded-full bg-[#EDF5FA] items-center justify-center mr-3">
            <Ionicons
              name="lock-closed"
              size={21}
              color="#5B82A5"
            />
          </View>

          {/* INPUT */}
          <View className="flex-1">

            <Text className="text-dark font-medium">
              {label} <Text className="text-brand">*</Text>
            </Text>

            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#91A9C1"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="text-[#001F3F] text-base mt-1 p-0"
            />

          </View>

          {/* SHOW / HIDE */}
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
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

      {/* ERROR */}
      {error ? (
        <Text className="text-red-500 text-sm mt-2 ml-1">
          {error}
        </Text>
      ) : null}

    </View>
  );
}