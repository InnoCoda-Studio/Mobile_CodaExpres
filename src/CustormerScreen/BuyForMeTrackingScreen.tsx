
// import React from "react";
// import { useNavigation } from "@react-navigation/native";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// import MarketSearchScreen from "./MarketSearchScreen";
// import type { CustomerStackParamList } from "./Navigation/CustomerTabs";

// type Navigation = NativeStackNavigationProp<
//   CustomerStackParamList,
//   "BuyForMe"
// >;

// export default function BuyForMeFlowScreen() {
//   const navigation = useNavigation<Navigation>();

//   const handleOrderComplete = (orderData: unknown) => {
//     console.log("Buy For Me order received:", orderData);

//     const orderId = `SHOP-${Date.now()}`;

//     navigation.replace("FindingRider", {
//       orderId,
//       serviceType: "shopping",
//     });
//   };

//   return (
//     <MarketSearchScreen
//       userCoords={[3.3792, 6.5244]}
//       onBack={() => navigation.goBack()}
//       onOrderComplete={handleOrderComplete}
//     />
//   );
// }
