import React from "react";
import { useNavigation } from "@react-navigation/native";
import MarketSearchScreen from "./MarketSearchScreen";

export default function BuyForMeFlowScreen() {
  const navigation = useNavigation();

  return (
    <MarketSearchScreen
      userCoords={[3.3792, 6.5244]}
      onBack={() => navigation.goBack()}
      onOrderComplete={(orderData) => {
        console.log("Buy For Me order:", orderData);
      }}
    />
  );
}