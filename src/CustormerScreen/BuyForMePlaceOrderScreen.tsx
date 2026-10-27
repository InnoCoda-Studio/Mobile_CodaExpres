import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BuyForMeReviewOrder } from "./BuyForMeReviewScreen";

type Props = {
  order: BuyForMeReviewOrder;
  onBack: () => void;
  onPlaceOrder?: (order: BuyForMeReviewOrder) => Promise<{ id: string }>;
  onOrderPlaced?: (orderId: string) => void;
  onPreviewOrder?: () => void;
};

const money = (amount: number) => `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

export default function BuyForMePlaceOrderScreen({ 
 order,
  onBack,
  onPlaceOrder,
  onOrderPlaced,
  onPreviewOrder,
 }: Props) {

  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const quantity = useMemo(() => order.items.reduce((sum, item) => sum + item.quantity, 0), [order.items]);
  const hasPrice = order.deliveryFee !== null && order.estimatedTotal !== null &&
    Number.isFinite(order.deliveryFee) && Number.isFinite(order.estimatedTotal);
  const hasRealRoute = order.distanceKm !== null && Number.isFinite(order.distanceKm) && order.distanceKm >= 0;
  const ready = hasPrice && hasRealRoute && !!order.deliveryAddress.trim() && agreed && !submitting && !!onPlaceOrder;

  
  const placeOrder = async () => {
    if (!ready || !onPlaceOrder) return;
    try {
      setSubmitting(true);
      const response = await onPlaceOrder(order);
      if (!response?.id) throw new Error("The server did not return an order ID.");
      onOrderPlaced?.(response.id);
    } catch (error) {
      Alert.alert("Order not placed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrderPress = () => {
  if (onPlaceOrder) {
    void placeOrder();
    return;
  }

  // Frontend testing only — does not create an order
  onPreviewOrder?.();
};

  const Detail = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
    <View className="flex-row justify-between items-start py-2">
      <Text className="text-slate-400 text-xs flex-1 mr-4">{label}</Text>
      <Text className={`${highlight ? "text-brand" : "text-white"} text-xs font-bold text-right flex-1`}>{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-darkBg" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />
      <View className="flex-row items-center px-4 py-4 bg-darkHeader border-b border-darkBorder">
        <TouchableOpacity onPress={onBack} disabled={submitting} accessibilityLabel="Back to review" className="w-11 h-11 rounded-2xl bg-darkCard items-center justify-center">
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-white text-lg font-extrabold">Place Your Order</Text>
          <Text className="text-slate-400 text-xs mt-1" numberOfLines={1}>{order.market.name}</Text>
        </View>
        <View className="bg-rose-950/40 px-3 py-2 rounded-full"><Text className="text-brand text-[10px] font-extrabold">FINAL STEP</Text></View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-[22px] bg-rose-950/40 items-center justify-center border border-rose-900/50">
            <Ionicons name="bag-check-outline" size={32} color="#E11D48" />
          </View>
          <Text className="text-white text-[22px] font-extrabold mt-3">Ready to order?</Text>
          <Text className="text-slate-400 text-sm text-center mt-1">Check everything before requesting a rider.</Text>
        </View>

        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mb-4">
          <View className="flex-row items-center mb-3"><Ionicons name="location-outline" size={20} color="#E11D48" /><Text className="text-white font-extrabold text-base ml-2">Delivery Details</Text></View>
          <Detail label="Shopping at" value={order.market.name} />
          <Detail label="Deliver to" value={order.deliveryAddress} />
          <Detail label="Vehicle" value={order.vehicle.name} />
          <Detail label="Route distance" value={hasRealRoute ? `${order.distanceKm!.toFixed(1)} km` : "Not calculated"} />
          {order.deliveryNote ? <Detail label="Rider note" value={order.deliveryNote} /> : null}
        </View>

        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center"><Ionicons name="basket-outline" size={20} color="#E11D48" /><Text className="text-white font-extrabold text-base ml-2">Shopping List</Text></View>
            <Text className="text-slate-400 text-xs">{quantity} total</Text>
          </View>
          {order.items.map(item => <Detail key={item.id} label={`${item.quantity} × ${item.name}`} value={money(item.quantity * item.estimatedPrice)} />)}
          <View className="h-[1px] bg-darkBorder my-2" />
          <Detail label="Receipt requested" value={order.requireReceipt ? "Yes" : "No"} />
        </View>

        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mb-4">
          <View className="flex-row items-center mb-3"><Ionicons name="receipt-outline" size={20} color="#E11D48" /><Text className="text-white font-extrabold text-base ml-2">Payment Estimate</Text></View>
          <Detail label="Items budget" value={money(order.itemsBudget)} />
          <Detail label="Delivery fee" value={order.deliveryFee === null ? "Pending" : money(order.deliveryFee)} />
          <Detail label="Service fee" value={money(order.serviceFee)} />
          <View className="h-[1px] bg-darkBorder my-3" />
          <View className="flex-row justify-between items-center"><Text className="text-white text-base font-extrabold">Estimated total</Text><Text className="text-emerald-400 text-xl font-extrabold">{order.estimatedTotal === null ? "Pending" : money(order.estimatedTotal)}</Text></View>
        </View>

        <View className="bg-darkHeader border border-darkBorder rounded-2xl p-4 mb-4 flex-row items-start">
          <Ionicons name="information-circle-outline" size={21} color="#38BDF8" />
          <Text className="text-slate-300 text-xs leading-5 ml-3 flex-1">These amounts are estimates, not a payment request. Your backend must validate the route, prices, rider availability, and final payment arrangement before creating an order. No escrow or automatic charge is active here.</Text>
        </View>

        {!hasRealRoute && <View className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-3 mb-4"><Text className="text-amber-300 text-xs font-bold">A real market-to-drop-off route is required before placing an order. The 5 km preview cannot be used for dispatch.</Text></View>}
        {!onPlaceOrder && <View className="bg-darkCard border border-darkBorder rounded-2xl p-3 mb-4"><Text className="text-slate-300 text-xs">Order posting is not connected to the backend yet. You can review this page, but the Place Order button stays disabled.</Text></View>}

        <TouchableOpacity onPress={() => setAgreed(!agreed)} activeOpacity={0.85} accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} className="flex-row items-start mb-2">
          <Ionicons name={agreed ? "checkbox" : "square-outline"} size={24} color={agreed ? "#E11D48" : "#94A3B8"} />
          <Text className="text-slate-300 text-xs leading-5 ml-3 flex-1">I have checked my shopping list and delivery details. I understand the amounts shown are estimates and final charges must be confirmed.</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="bg-darkBg border-t border-darkBorder px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="flex-row items-center justify-between mb-3"><Text className="text-slate-400 text-sm">Estimated total</Text><Text className="text-white text-lg font-extrabold">{order.estimatedTotal === null ? "Pending" : money(order.estimatedTotal)}</Text></View>
      <TouchableOpacity
  disabled={onPlaceOrder ? !ready : !agreed || !onPreviewOrder}
  onPress={handlePlaceOrderPress}
  activeOpacity={0.85}
  className={`rounded-[18px] py-4 flex-row justify-center items-center ${
    (onPlaceOrder ? ready : agreed && !!onPreviewOrder)
      ? "bg-brand"
      : "bg-slate-700"
  }`}
>
  {submitting ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <>
      <Text className="text-white text-base font-extrabold">
        {onPlaceOrder ? "Place Order" : "Preview Next Screen"}
      </Text>
      <Ionicons
        name="arrow-forward"
        size={19}
        color="#FFFFFF"
        style={{ marginLeft: 10 }}
      />
    </>
  )}
</TouchableOpacity>
        <Text className="text-slate-500 text-[11px] text-center mt-2">Rider search and tracking start only after the server accepts your order.</Text>
      </View>
    </View>
  );
}
