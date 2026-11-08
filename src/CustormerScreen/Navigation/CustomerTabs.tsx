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
import MarketSearchScreen from "../MarketSearchScreen";
import BuyForMeFlowScreen from "../BuyForMeFlowScreen";
import FindingRiderScreen from "../FindingRiderScreen";
import OrdersScreen from "../OrdersScreen";
// import BuyForMeTrackingScreen from "../BuyForMeTrackingScreen";
import DeliveryTrackingScreen from "../DeliveryTrackingScreen";
// import WalletScreen from "../WalletScreen";
import ProfileScreen from "../ProfileScreen";

// Root stack parameter types
// export type CustomerStackParamList = {
//   MainTabs: undefined;
//   PackageDelivery: undefined;
//   BuyForMe: undefined;
//   FindingRider: { orderId: string };
// };

export type CustomerStackParamList = {
  MainTabs: undefined;
  PackageDelivery: undefined;
  BuyForMe: undefined;

  FindingRider: {
    orderId: string;
    serviceType?: "delivery" | "shopping";
    pickup?: string;
    dropoff?: string;
    price?: string;
  };

  DeliveryTracking: {
    orderId: string;
    serviceType?: "delivery" | "shopping";
  };
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
        component={PackageDelivery}
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

      {/* <Tab.Screen
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
      /> */}

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

      

      {/* <Stack.Screen
        name="BuyForMe"
        component={BuyForMeFlowScreen}
      /> */}

      <Stack.Screen
        name="FindingRider"
        component={FindingRiderScreen}
      />

      {/* <Stack.Screen
        name="BuyForMeTracking"
        component={BuyForMeTrackingScreen}
      /> */}

      <Stack.Screen
      name="DeliveryTracking"
      component={DeliveryTrackingScreen}
    />
          
    </Stack.Navigator>
  );
}