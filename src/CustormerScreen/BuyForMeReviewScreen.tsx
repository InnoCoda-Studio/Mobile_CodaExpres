import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MarketItem } from "./MarketSearchScreen";
import type { ShoppingItem } from "./BuyForMeItemsScreen";
import type { BuyForMeVehicle } from "./BuyForMeVehicleScreen";
import BuyForMePlaceOrderScreen from "./BuyForMePlaceOrderScreen";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CustomerStackParamList } from "./Navigation/CustomerTabs";


export type BuyForMeReviewOrder = {
  market: MarketItem;
  items: ShoppingItem[];
  vehicle: BuyForMeVehicle;
  requireReceipt: boolean;
  deliveryAddress: string;
  deliveryNote: string;
  itemsBudget: number;
  deliveryFee: number | null;
  serviceFee: number;
  estimatedTotal: number | null;
  distanceKm: number | null;
  pricingStatus: "estimated" | "pending_route";
};

type Props = {
  market: MarketItem;
  items: ShoppingItem[];
  vehicle: BuyForMeVehicle;
  requireReceipt: boolean;
  totalEstimatedPrice: number;
  deliveryFee?: number | null;
  distanceKm?: number | null;
  serviceFee?: number;
  initialDeliveryAddress?: string;
  currencySymbol?: string;
  onBack: () => void;
  onConfirmOrder: (finalOrder: BuyForMeReviewOrder) => void;
};

export default function BuyForMeReviewScreen({
  market,
  items,
  vehicle,
  requireReceipt,
  totalEstimatedPrice,
  deliveryFee = null,
  distanceKm = null,
  serviceFee = 500,
  initialDeliveryAddress = "",
  currencySymbol = "₦",
  onBack,
  onConfirmOrder,
}: Props) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  const [deliveryAddress, setDeliveryAddress] = useState(initialDeliveryAddress);

  const [deliveryNote, setDeliveryNote] = useState("");
  const [editingAddress, setEditingAddress] = useState(!initialDeliveryAddress.trim());
  const [addressError, setAddressError] = useState(false);
  const [placeOrderData, setPlaceOrderData] = useState<BuyForMeReviewOrder | null>(null);

  const itemsBudget = useMemo(() => {
    const amount = Number(totalEstimatedPrice);
    return Number.isFinite(amount) && amount >= 0
      ? amount
      : items.reduce((sum, item) => sum + item.quantity * item.estimatedPrice, 0);
  }, [items, totalEstimatedPrice]);

  const validDeliveryFee =
    typeof deliveryFee === "number" && Number.isFinite(deliveryFee) && deliveryFee >= 0
      ? deliveryFee
      : null;
  const validServiceFee = Number.isFinite(serviceFee) && serviceFee >= 0 ? serviceFee : 0;
  const estimatedTotal =
    validDeliveryFee === null ? null : itemsBudget + validDeliveryFee + validServiceFee;

  const money = (value: number) =>
    `${currencySymbol}${value.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

const handleContinue = () => {
  // Don't continue without a valid delivery price
  if (validDeliveryFee === null || estimatedTotal === null) {
    return;
  }

  // Customer must provide a delivery address
  if (!deliveryAddress.trim()) {
    setAddressError(true);
    setEditingAddress(true);
    return;
  }

  setAddressError(false);

  const finalOrder: BuyForMeReviewOrder = {
    market,
    items,
    vehicle,
    requireReceipt,

    deliveryAddress: deliveryAddress.trim(),
    deliveryNote: deliveryNote.trim(),

    itemsBudget,
    deliveryFee: validDeliveryFee,
    serviceFee: validServiceFee,
    estimatedTotal,

    distanceKm:
      typeof distanceKm === "number" &&
      Number.isFinite(distanceKm) &&
      distanceKm >= 0
        ? distanceKm
        : null,

    pricingStatus: "estimated",
  };

  setPlaceOrderData(finalOrder);
};

  const DetailRow = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
    <View className="flex-row justify-between items-start py-2">
      <Text className="text-slate-400 text-xs flex-1 mr-3">{label}</Text>
      <Text className={`text-xs font-bold text-right flex-1 ${accent ? "text-brand" : "text-white"}`}>
        {value}
      </Text>
    </View>
  );

  if (placeOrderData) {
  return (
    <BuyForMePlaceOrderScreen
      order={placeOrderData}
      onBack={() => setPlaceOrderData(null)}
      onPreviewOrder={() => {
        navigation.navigate("FindingRider", {
          orderId: "DEMO-CDX-001",
        });
      }}
    />
  );
}

// if (placeOrderData) {
//   return (
//     <BuyForMePlaceOrderScreen
//       order={placeOrderData}
//       onBack={() => setPlaceOrderData(null)}
//       onPreviewOrder={() => {
//         console.log("Open Finding Rider preview");
//       }}
//     />
//   );
// }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-darkBg"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 bg-darkHeader border-b border-darkBorder">
        <TouchableOpacity
          onPress={onBack}
          className="w-11 h-11 rounded-2xl bg-darkCard items-center justify-center"
          accessibilityLabel="Back to vehicle selection"
        >
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="text-white text-lg font-extrabold">Review Your Order</Text>
          <Text className="text-slate-400 text-xs mt-1" numberOfLines={1}>{market.name}</Text>
        </View>
        <View className="bg-rose-950/40 px-3 py-1.5 rounded-full">
          <Text className="text-brand text-[10px] font-extrabold">STEP 3 OF 3</Text>
        </View>
      </View>

      {/* STEPPER */}
      <View className="flex-row items-center justify-center px-4 py-5">
        <Ionicons name="checkmark-circle" size={19} color="#10B981" />
        <Text className="text-emerald-400 text-xs font-bold ml-1">Items</Text>
        <View className="w-6 h-[2px] bg-emerald-500 mx-2" />
        <Ionicons name="checkmark-circle" size={19} color="#10B981" />
        <Text className="text-emerald-400 text-xs font-bold ml-1">Vehicle</Text>
        <View className="w-6 h-[2px] bg-emerald-500 mx-2" />
        <View className="w-6 h-6 bg-brand rounded-full items-center justify-center">
          <Text className="text-white text-xs font-extrabold">3</Text>
        </View>
        <Text className="text-brand text-xs font-extrabold ml-1">Review</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
      >
        <Text className="text-white text-[22px] font-extrabold mb-1">Almost there!</Text>
        <Text className="text-slate-400 text-sm mb-5">
          Check your shopping details before proceeding.
        </Text>

        {/* MARKET AND VEHICLE */}
        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="storefront-outline" size={20} color="#E11D48" />
            <Text className="text-white font-extrabold text-base ml-2">Market & Transport</Text>
          </View>
          <DetailRow label="Shopping at" value={market.name} />
          <DetailRow label="Vehicle" value={vehicle.name} accent />
          <DetailRow label="Capacity guidance" value={vehicle.capacity} />
          <DetailRow
            label="Route distance"
            value={distanceKm != null && Number.isFinite(distanceKm) ? `${distanceKm.toFixed(1)} km (estimated)` : "Not calculated yet"}
          />
        </View>

        {/* ADDRESS */}
        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={20} color="#E11D48" />
              <Text className="text-white font-extrabold text-base ml-2">Drop-off Location</Text>
            </View>
            {!editingAddress && (
              <TouchableOpacity onPress={() => setEditingAddress(true)} className="flex-row items-center p-1">
                <Ionicons name="create-outline" size={16} color="#E11D48" />
                <Text className="text-brand text-xs font-bold ml-1">Change</Text>
              </TouchableOpacity>
            )}
          </View>
          {editingAddress ? (
            <View>
              <TextInput
                value={deliveryAddress}
                onChangeText={(text) => { setDeliveryAddress(text); setAddressError(false); }}
                placeholder="Enter your delivery address"
                placeholderTextColor="#64748B"
                multiline
                className={`bg-darkHeader border rounded-xl px-3 py-3 text-white text-sm min-h-[54px] ${addressError ? "border-red-500" : "border-darkBorder"}`}
              />
              {addressError && <Text className="text-red-400 text-xs mt-2">A delivery address is required.</Text>}
              <TouchableOpacity
                onPress={() => {
                  if (!deliveryAddress.trim()) { setAddressError(true); return; }
                  setEditingAddress(false);
                }}
                className="self-end mt-2 bg-brand rounded-xl px-4 py-2"
              >
                <Text className="text-white text-xs font-extrabold">Save Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-start">
              <Ionicons name="navigate-circle-outline" size={21} color="#38BDF8" />
              <Text className="text-white text-sm font-semibold flex-1 ml-2">{deliveryAddress}</Text>
            </View>
          )}
          <Text className="text-slate-400 text-xs mt-4 mb-2">Delivery instructions (optional)</Text>
          <TextInput
            value={deliveryNote}
            onChangeText={setDeliveryNote}
            placeholder="E.g. Call me at the gate"
            placeholderTextColor="#64748B"
            multiline
            className="bg-darkHeader border border-darkBorder rounded-xl px-3 py-3 text-white text-sm min-h-[48px]"
          />
        </View>

        {/* SHOPPING LIST */}
        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="basket-outline" size={20} color="#E11D48" />
              <Text className="text-white font-extrabold text-base ml-2">Shopping List</Text>
            </View>
            <View className="bg-darkHeader px-2.5 py-1 rounded-full">
              <Text className="text-slate-300 text-[11px] font-bold">{items.length} types</Text>
            </View>
          </View>
          {items.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center py-2.5 border-b border-darkBorder">
              <View className="flex-1 mr-3">
                <Text className="text-white text-sm font-semibold">{item.name}</Text>
                <Text className="text-slate-400 text-xs mt-1">Qty: {item.quantity} · {money(item.estimatedPrice)} each</Text>
              </View>
              <Text className="text-white text-sm font-extrabold">{money(item.estimatedPrice * item.quantity)}</Text>
            </View>
          ))}
          <View className="flex-row items-center mt-3">
            <Ionicons name={requireReceipt ? "checkbox" : "square-outline"} size={18} color={requireReceipt ? "#10B981" : "#94A3B8"} />
            <Text className="text-slate-300 text-xs ml-2">
              {requireReceipt ? "Request a market receipt" : "Market receipt not requested"}
            </Text>
          </View>
        </View>

        {/* PRICING */}
        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="receipt-outline" size={20} color="#E11D48" />
            <Text className="text-white font-extrabold text-base ml-2">Price Breakdown</Text>
          </View>
          <DetailRow label="Estimated items budget" value={money(itemsBudget)} />
          <DetailRow label="Estimated delivery fee" value={validDeliveryFee === null ? "Awaiting route price" : money(validDeliveryFee)} />
          <DetailRow label="Service fee (estimate)" value={money(validServiceFee)} />
          <View className="h-[1px] bg-darkBorder my-3" />
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base font-extrabold">Estimated Total</Text>
            <Text className="text-emerald-400 text-xl font-extrabold">
              {estimatedTotal === null ? "Pending" : money(estimatedTotal)}
            </Text>
          </View>
          <View className="flex-row items-start bg-darkHeader rounded-xl p-3 mt-4">
            <Ionicons name="information-circle-outline" size={18} color="#38BDF8" />
            <Text className="text-slate-400 text-xs leading-5 ml-2 flex-1">
              Shopping prices and fees are estimates. Final charges must be verified before payment or rider dispatch. No escrow is active on this screen.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* STICKY ACTION */}
      <View
        className="bg-darkHeader border-t border-darkBorder px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={validDeliveryFee === null}
          className={`rounded-[18px] py-4 flex-row items-center justify-center ${validDeliveryFee === null ? "bg-slate-700" : "bg-brand"}`}
        >
          <Text className="text-white text-base font-extrabold">
            {validDeliveryFee === null ? "Delivery Price Required" : "Continue to Place Order"}
          </Text>
          {validDeliveryFee !== null && <Ionicons name="arrow-forward" size={19} color="#FFFFFF" style={{ marginLeft: 10 }} />}
        </TouchableOpacity>
        <Text className="text-slate-500 text-[11px] text-center mt-2">
          No payment or dispatch happens on this screen.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
