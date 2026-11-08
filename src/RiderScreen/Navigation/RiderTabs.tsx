import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import RiderHomeScreen from "../RiderHomeScreen";
import RiderOrdersScreen from "../RiderOrdersScreen";
import RiderWalletScreen from "../WalletScreen";
import RiderProfileScreen from "../RiderProfileScreen";

export type RiderTabParamList = {
  RiderHome: undefined;
  RiderOrders: undefined;
  RiderWallet: undefined;
  RiderProfile: undefined;
};

const Tab = createBottomTabNavigator<RiderTabParamList>();

export default function RiderTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E11D48",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#090D16",
          borderTopColor: "#1E293B",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      <Tab.Screen
        name="RiderHome"
        options={{
          title: "Dispatch",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <RiderHomeScreen
            {...props}
            onTopUp={() => navigation.navigate("RiderWallet")}
            onNavigateTab={(tab) => {
              if (tab === "profile") navigation.navigate("RiderProfile");
              if (tab === "history") navigation.navigate("RiderOrders");
              if (tab === "wallet") navigation.navigate("RiderWallet");
            }}
            onSimulateIncomingOrder={(orderPayload) => {
              // Navigates directly to the full-screen ActiveOrderTracker screen!
              navigation.navigate("ActiveOrderTracker", { order: orderPayload });
            }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="RiderOrders"
        component={RiderOrdersScreen}
        options={{
          title: "Deliveries",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RiderWallet"
        component={RiderWalletScreen}
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RiderProfile"
        component={RiderProfileScreen}
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}