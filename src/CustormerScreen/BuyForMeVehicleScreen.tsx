
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Pressable,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BuyForMeReviewScreen from "./BuyForMeReviewScreen";
import type { MarketItem } from "./MarketSearchScreen";
import type { ShoppingItem } from "./BuyForMeItemsScreen";

export type BuyForMeVehicle = {
  id: "bicycle" | "motorcycle" | "car";
  name: string;
  description: string;
  capacity: string;
  baseFare: number;
  perKm: number;
  estimatedDeliveryFee?: number;
  distanceKm?: number;
};

type Props = {
  market: MarketItem;
  items: ShoppingItem[];
  requireReceipt: boolean;
  distanceKm?: number;
  onBack: () => void;
};

const VEHICLES: BuyForMeVehicle[] = [
  {
    id: "bicycle",
    name: "Bicycle",
    description: "Small groceries & light errands",
    capacity: "Up to 5 kg",
    baseFare: 700,
    perKm: 160,
  },
  {
    id: "motorcycle",
    name: "Motorcycle / Okada",
    description: "Fast delivery for everyday shopping",
    capacity: "Up to 20 kg",
    baseFare: 1200,
    perKm: 260,
  },
  {
    id: "car",
    name: "Car / Minivan",
    description: "Bulky shopping & heavy packages",
    capacity: "Over 20 kg",
    baseFare: 2500,
    perKm: 500,
  },
];

const VEHICLE_IMAGES = {
  bicycle: require("../../assets/bisycle_move.png"),
  motorcycle: require("../../assets/bike-man-on-rider.png"),
  car: require("../../assets/car.png"),
};

const formatMoney = (value: number) => `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const getDeliveryFee = (vehicle: BuyForMeVehicle, distanceKm: number) =>
  Math.round(vehicle.baseFare + distanceKm * vehicle.perKm);

type VehicleCardProps = {
  vehicle: BuyForMeVehicle;
  selected: boolean;
  onPress: () => void;
  distanceKm: number;
};

function VehicleCard({
  vehicle,
  selected,
  onPress,
  distanceKm,
}: VehicleCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 5,
      tension: 130,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        marginBottom: 14,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${vehicle.name}, ${vehicle.capacity}`}
        className={`relative rounded-[22px] border-2 overflow-hidden ${
          selected
            ? "border-brand bg-darkHeader"
            : "border-darkBorder bg-darkCard"
        }`}
      >
        {selected && (
          <View className="absolute top-0 right-0 bg-brand px-3 py-1.5 rounded-bl-xl z-10">
            <Text className="text-white text-[10px] font-extrabold">
              SELECTED
            </Text>
          </View>
        )}

        <View className="flex-row items-center p-4">
          {/* VEHICLE IMAGE */}
          <View
            className={`w-[88px] h-[88px] rounded-2xl items-center justify-center mr-3 overflow-hidden ${
              selected
                ? "bg-darkBg"
                : "bg-darkHeader"
            }`}
          >
            <Image
              source={VEHICLE_IMAGES[vehicle.id]}
              style={{ width: 82, height: 82 }}
              resizeMode="contain"
            />
          </View>

          {/* VEHICLE DETAILS */}
          <View className="flex-1 pr-1">
            <Text className="text-white text-[15px] font-extrabold">
              {vehicle.name}
            </Text>

            <Text className="text-slate-300 text-xs mt-1 leading-4">
              {vehicle.description}
            </Text>

            <View className="flex-row items-center mt-2">
              <Ionicons
                name="cube-outline"
                size={13}
                color="#38BDF8"
              />

              <Text className="text-rider text-[11px] font-bold ml-1">
                {vehicle.capacity}
              </Text>
            </View>

            <Text className="text-white text-base font-extrabold mt-2">
              {formatMoney(getDeliveryFee(vehicle, distanceKm))}
              <Text className="text-slate-400 text-[10px] font-medium">  est. delivery</Text>
            </Text>

            {vehicle.id === "motorcycle" && (
              <View className="self-start bg-sky-900/40 px-2 py-1 rounded-lg mt-2">
                <Text className="text-sky-300 text-[10px] font-extrabold">
                  POPULAR CHOICE
                </Text>
              </View>
            )}
          </View>

          {/* SELECTION INDICATOR */}
          <View
            className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
              selected
                ? "bg-brand border-brand"
                : "bg-transparent border-slate-600"
            }`}
          >
            {selected && (
              <Ionicons
                name="checkmark"
                size={18}
                color="#FFFFFF"
              />
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function BuyForMeVehicleScreen({
  market,
  items = [],
  requireReceipt,
  distanceKm,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();

  const [showReview, setShowReview] = useState(false);

  const [reviewVehicle, setReviewVehicle] = useState<
    BuyForMeVehicle & {
      estimatedDeliveryFee?: number;
      distanceKm?: number;
    }
  >();

  const hasRouteDistance = typeof distanceKm === "number" && Number.isFinite(distanceKm) && distanceKm >= 0;
  const pricingDistance = hasRouteDistance ? distanceKm! : 5; // preview only, not a measured route


  const [selectedId, setSelectedId] =
    useState<BuyForMeVehicle["id"]>("motorcycle");

  const selectedVehicle = VEHICLES.find(
    (vehicle) => vehicle.id === selectedId
  )!;

  const totalItems = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const estimatedBudget = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.estimatedPrice || 0),
        0
      ),
    [items]
  );

  const deliveryFee = getDeliveryFee(selectedVehicle, pricingDistance);
  const totalEstimate = estimatedBudget + deliveryFee;

  if (showReview && reviewVehicle) {
  return (
    <BuyForMeReviewScreen
      market={market}
      items={items}
      vehicle={reviewVehicle}
      requireReceipt={requireReceipt}
      totalEstimatedPrice={estimatedBudget}
      deliveryFee={reviewVehicle.estimatedDeliveryFee}
      distanceKm={reviewVehicle.distanceKm}
      onBack={() => setShowReview(false)}
      onConfirmOrder={(order) => {
        console.log("Order ready for placement:", order);

        // Next step:
        // Connect to the Place Order screen.
      }}
    />
  );
}

  return (
    <View
      className="flex-1 bg-darkBg"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#090D16"
      />

      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 bg-darkHeader border-b border-darkBorder">
        <TouchableOpacity
          onPress={onBack}
          className="w-11 h-11 rounded-2xl bg-darkCard items-center justify-center"
          accessibilityLabel="Go back to shopping items"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View className="ml-3 flex-1">
          <Text className="text-white text-lg font-extrabold">
            Buy For Me
          </Text>

          <Text
            className="text-slate-400 text-xs mt-1"
            numberOfLines={1}
          >
            {market.name}
          </Text>
        </View>

        <View className="bg-rose-950/40 px-3 py-1.5 rounded-full">
          <Text className="text-brand text-[10px] font-extrabold">
            STEP 2 OF 3
          </Text>
        </View>
      </View>

      {/* PROGRESS STEPPER */}
      <View className="flex-row items-center justify-center px-4 py-5">
        <View className="flex-row items-center">
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#10B981"
          />
          <Text className="text-status-success text-xs font-bold ml-1">
            Items
          </Text>
        </View>

        <View className="w-7 h-[2px] bg-status-success mx-2" />

        <View className="flex-row items-center">
          <View className="w-6 h-6 bg-brand rounded-full items-center justify-center">
            <Text className="text-white text-xs font-extrabold">
              2
            </Text>
          </View>
          <Text className="text-brand text-xs font-extrabold ml-1">
            Vehicle
          </Text>
        </View>

        <View className="w-7 h-[2px] bg-darkBorder mx-2" />

        <View className="flex-row items-center">
          <View className="w-6 h-6 rounded-full bg-darkCard items-center justify-center">
            <Text className="text-slate-400 text-xs font-bold">
              3
            </Text>
          </View>
          <Text className="text-slate-400 text-xs font-bold ml-1">
            Review
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        {/* TITLE */}
        <Text className="text-white text-[22px] font-extrabold">
          Choose Your Vehicle
        </Text>

        <Text className="text-slate-400 text-sm mt-2 mb-5">
          Select the best transport option for your shopping.
        </Text>

        {/* VEHICLE CARDS */}
        <View accessibilityRole="radiogroup">
          {VEHICLES.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              selected={selectedId === vehicle.id}
              onPress={() => setSelectedId(vehicle.id)}
              distanceKm={pricingDistance}
            />
          ))}
        </View>

        {/* SUMMARY */}
        <View className="bg-darkCard border border-darkBorder rounded-[22px] p-4 mt-2">
          <View className="flex-row items-center mb-4">
            <Ionicons
              name="receipt-outline"
              size={20}
              color="#E11D48"
            />
            <Text className="text-white text-base font-extrabold ml-2">
              Your Shopping Summary
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400 text-xs">
              Market
            </Text>
            <Text
              className="text-white text-xs font-bold flex-1 text-right ml-3"
              numberOfLines={2}
            >
              {market.name}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400 text-xs">
              Total quantity
            </Text>
            <Text className="text-white text-xs font-bold">
              {totalItems}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400 text-xs">
              Shopping budget
            </Text>
            <Text className="text-white text-xs font-bold">
              {formatMoney(estimatedBudget)}
            </Text>
          </View>

          <View className="h-[1px] bg-darkBorder my-2" />

          <Text className="text-white text-sm font-extrabold mb-3">Delivery Estimate</Text>
          <Text className="text-slate-400 text-xs mb-3">
            {hasRouteDistance
              ? `Using ${pricingDistance.toFixed(1)} km supplied route distance`
              : "Preview only: assuming 5 km until the delivery route is known"}
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-400 text-xs">Base fare</Text>
            <Text className="text-white text-xs font-bold">{formatMoney(selectedVehicle.baseFare)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-400 text-xs">Distance ({pricingDistance.toFixed(1)} km × {formatMoney(selectedVehicle.perKm)})</Text>
            <Text className="text-white text-xs font-bold">{formatMoney(pricingDistance * selectedVehicle.perKm)}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-300 text-xs font-semibold">Estimated delivery fee</Text>
            <Text className="text-brand text-base font-extrabold">{formatMoney(deliveryFee)}</Text>
          </View>
          <View className="h-[1px] bg-darkBorder my-2" />
          <View className="flex-row justify-between mb-3">
            <Text className="text-white text-xs font-bold">Items + delivery</Text>
            <Text className="text-white text-base font-extrabold">{formatMoney(totalEstimate)}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-xs">
              Selected vehicle
            </Text>
            <Text className="text-brand text-xs font-extrabold">
              {selectedVehicle.name}
            </Text>
          </View>

          <View className="flex-row items-start bg-darkHeader rounded-xl p-3 mt-4">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#0284C7"
            />
            <Text className="flex-1 text-slate-400 text-xs leading-5 ml-2">
              These are sample MVP rates. Delivery fee is an estimate, not a final quote. Market service fees, waiting fees and any other charges are not included. Recalculate the road distance and confirm the final price at checkout.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View
        className="bg-darkBg border-t border-darkBorder px-4 pt-3"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
       <TouchableOpacity
//   onPress={() => {
//     setReviewVehicle({
//       ...selectedVehicle,
//       estimatedDeliveryFee: hasRouteDistance
//         ? deliveryFee
//         : undefined,
//       distanceKm: hasRouteDistance
//         ? pricingDistance
//         : undefined,
//     });

//     setShowReview(true);
//   }}
onPress={() => {
  setReviewVehicle({
    ...selectedVehicle,
    estimatedDeliveryFee: deliveryFee,
    distanceKm: pricingDistance,
  });

  setShowReview(true);
}}
  activeOpacity={0.85}
  className="bg-brand rounded-[18px] py-4 flex-row items-center justify-center"
>
  <Text className="text-white text-base font-extrabold">
    Continue to Review
  </Text>

  <Ionicons
    name="arrow-forward"
    size={19}
    color="#FFFFFF"
    style={{ marginLeft: 10 }}
  />
</TouchableOpacity>
      </View>
    </View>
  );
}
