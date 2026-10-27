import React from "react";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


// Import Screens
import CustomerHomeScreen from "../../screens/CustomerHomeScreen";
import PackageDelivery from "../PackageDelivery";
// import MarketSearchScreen from "../MarketSearchScreen";
import BuyForMeFlowScreen from "../BuyForMeFlowScreen";
import FindingRiderScreen from "../FindingRiderScreen";
import OrdersScreen from "../OrdersScreen";


// Root stack parameter types
export type CustomerStackParamList = {
  MainTabs: undefined;
  PackageDelivery: undefined;
  BuyForMe: undefined;
  FindingRider: { orderId: string };
};

// Bottom tab parameter types
export type CustomerTabParamList = {
  Home: undefined;
  Orders: undefined;
  Wallet: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

// Temporary Orders Screen
// function OrdersScreen() {
//   return (
//     <View className="flex-1 bg-[#090D16] justify-center items-center">
//       <Text className="text-white font-bold text-lg">
//         My Orders
//       </Text>

//       <Text className="text-slate-400 mt-2">
//         Your active and past orders will appear here.
//       </Text>
//     </View>
//   );
// }

// Temporary Wallet Screen
function WalletScreen() {
  return (
    <View className="flex-1 bg-[#090D16] justify-center items-center">
      <Text className="text-white font-bold text-lg">
        Wallet
      </Text>
    </View>
  );
}

// Temporary Profile Screen
function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#090D16] justify-center items-center">
      <Text className="text-white font-bold text-lg">
        Customer Profile
      </Text>
    </View>
  );
}

// Bottom Tab Navigator
function CustomerTabNavigator() {
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, 12);
  const totalBarHeight = 60 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#090D16",
          borderTopColor: "#1E293B",
          height: totalBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 0,
        },

        tabBarActiveTintColor: "#E11D48",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home"
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="document-text-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="wallet-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function CustomerTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#090D16",
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={CustomerTabNavigator}
      />

      <Stack.Screen
        name="PackageDelivery"
        component={PackageDelivery}
      />

      

      <Stack.Screen
        name="BuyForMe"
        component={BuyForMeFlowScreen}
      />

      <Stack.Screen
        name="FindingRider"
        component={FindingRiderScreen}
      />
    </Stack.Navigator>
  );
}