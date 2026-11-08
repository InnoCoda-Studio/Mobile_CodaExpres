import React, { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import Rider screens
import RiderHomeScreen from "./RiderHomeScreen";
import ActiveOrderTrackerScreen from "./ActiveOrderTrackerScreen";
import WalletScreen from "./WalletScreen";
import RiderProfileScreen from "./RiderProfileScreen";

// Import offline notice
import OfflineNotice from "./OfflineNotice";

type RiderRoute = "home" | "wallet" | "history" | "profile" | "active_order";

export default function RiderNavigator() {
  const insets = useSafeAreaInsets();
  
  const [currentRoute, setCurrentRoute] = useState<RiderRoute>("home");
  const [isConnected, setIsConnected] = useState(true);

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* GLOBAL OFFLINE NOTICE BANNER */}
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

        {currentRoute === "profile" && (
          <RiderProfileScreen
            onBack={() => setCurrentRoute("home")}
            onLogout={() => {
              console.log("Logging out rider...");
            }}
          />
        )}

        {currentRoute === "history" && (
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