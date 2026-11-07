import React, { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import your Rider screens
import RiderHomeScreen from "./RiderHomeScreen";
import ActiveOrderTrackerScreen from "./ActiveOrderTrackerScreen";
import WalletScreen from "./WalletScreen";

// Import offline notice
import OfflineNotice from "./OfflineNotice";

type RiderRoute = "home" | "wallet" | "history" | "profile" | "active_order";

export default function RiderNavigator() {
  const insets = useSafeAreaInsets();
  
  // App navigation state (can be swapped with React Navigation later if preferred)
  const [currentRoute, setCurrentRoute] = useState<RiderRoute>("home");
  const [isConnected, setIsConnected] = useState(true); // Connected by default

  // Simulated network toggle for testing offline stability
  const toggleNetworkTest = () => {
    setIsConnected((prev) => !prev);
  };

  return (
    <View className="flex-1 bg-darkBg">
      {/* GLOBAL OFFLINE NOTICE BANNER (Prevents crashes/scratching) */}
      <OfflineNotice isConnected={isConnected} />

      {/* DYNAMIC SCREEN ROUTER */}
      <View className="flex-1">
        {currentRoute === "home" && (
          <RiderHomeScreen
            onNavigateTab={(tab) => setCurrentRoute(tab as RiderRoute)}
            onSimulateIncomingOrder={() => setCurrentRoute("active_order")}
            onTopUp={() => setCurrentRoute("wallet")}
          />
        )}

        {currentRoute === "wallet" && (
          <WalletScreen
            onBack={() => setCurrentRoute("home")}
          />
        )}

        {currentRoute === "active_order" && (
          <ActiveOrderTrackerScreen
            onBack={() => setCurrentRoute("home")}
            onUploadReceipt={() => {
              console.log("Navigating to Upload Receipt screen...");
            }}
            onNavigateToCustomer={() => {
              console.log("Opening navigation route to customer...");
            }}
          />
        )}

        {/* Fallback for other tabs */}
        {(currentRoute === "history" || currentRoute === "profile") && (
          <RiderHomeScreen
            onNavigateTab={(tab) => setCurrentRoute(tab as RiderRoute)}
            onSimulateIncomingOrder={() => setCurrentRoute("active_order")}
            onTopUp={() => setCurrentRoute("wallet")}
          />
        )}
      </View>
    </View>
  );
}