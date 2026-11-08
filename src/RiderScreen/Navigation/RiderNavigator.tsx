import React, { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import Rider screens
import RiderHomeScreen from "../RiderHomeScreen";
import ActiveOrderTrackerScreen from "../ActiveOrderTrackerScreen";
import WalletScreen from "../WalletScreen";
import RiderProfileScreen from "../RiderProfileScreen";
import RiderOrdersScreen from "../RiderOrdersScreen";

// Import offline notice banner
import OfflineNotice from "../OfflineNotice";

type RiderRoute = "home" | "wallet" | "history" | "profile" | "active_order";

type Props = {
  onSwitchToCustomer?: () => void;
  onLogout?: () => void;
};

export default function RiderNavigator({
  onSwitchToCustomer = () => {},
  onLogout = () => {},
}: Props) {
  const insets = useSafeAreaInsets();

  const [currentRoute, setCurrentRoute] = useState<RiderRoute>("home");
  const [activeOrderData, setActiveOrderData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Handle incoming order acceptance and navigation
  const handleAcceptOrder = (orderPayload?: any) => {
    const payload = orderPayload || {
      id: "CDX-94821",
      pickup: "Bola Matanmi St, Lekki Phase 1",
      dropoff: "Royal Garden Estate, Ajah",
      distance: "4.2 km",
      estimatedEarnings: "₦2,600",
      customerName: "Paul O.",
      customerPhone: "+2348031234567",
      packageType: "Documents & Laptop Box",
    };

    setActiveOrderData(payload);
    setCurrentRoute("active_order");
  };

  return (
    <View className="flex-1 bg-[#06090F]">
      {/* GLOBAL OFFLINE NOTICE BANNER */}
      <OfflineNotice isConnected={isConnected} />

      {/* DYNAMIC SCREEN ROUTER */}
      <View className="flex-1">
        {currentRoute === "home" && (
          <RiderHomeScreen
            onNavigateTab={(tab) => setCurrentRoute(tab as RiderRoute)}
            onSimulateIncomingOrder={(order) => handleAcceptOrder(order)}
            onTopUp={() => setCurrentRoute("wallet")}
          />
        )}

        {currentRoute === "wallet" && (
          <WalletScreen onBack={() => setCurrentRoute("home")} />
        )}

        {currentRoute === "active_order" && (
          <ActiveOrderTrackerScreen
            order={activeOrderData}
            onBack={() => {
              setActiveOrderData(null);
              setCurrentRoute("home");
            }}
          />
        )}

        {currentRoute === "history" && (
          <RiderOrdersScreen
            onBack={() => setCurrentRoute("home")}
            onSelectOrder={(order) => {
              console.log("Selected order detail:", order.id);
            }}
          />
        )}

        {currentRoute === "profile" && (
          <RiderProfileScreen
            onBack={() => setCurrentRoute("home")}
            onSwitchToCustomer={onSwitchToCustomer}
            onLogout={onLogout}
          />
        )}
      </View>
    </View>
  );
}