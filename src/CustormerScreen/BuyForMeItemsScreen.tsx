import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MarketItem } from "../CustormerScreen/MarketSearchScreen";
import BuyForMeVehicleScreen from "./BuyForMeVehicleScreen";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  image?: string;
};

type Props = {
  market?: MarketItem;
  currencySymbol?: string; // "₦" or "$"
  onBack?: () => void;
  onContinue?: (orderData: {
    items: ShoppingItem[];
    requireReceipt: boolean;
    totalEstimatedPrice: number;
  }) => void;
};

const DEFAULT_ITEMS: ShoppingItem[] = [
  {
    id: "1",
    name: "Rice (5kg)",
    quantity: 1,
    estimatedPrice: 12.0,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    name: "Cooking Oil (1L)",
    quantity: 2,
    estimatedPrice: 6.0,
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    name: "Tomatoes (Basket)",
    quantity: 1,
    estimatedPrice: 4.0,
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "4",
    name: "Onions (Bag)",
    quantity: 1,
    estimatedPrice: 3.0,
    image:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "5",
    name: "Maggi (Pack)",
    quantity: 3,
    estimatedPrice: 6.0,
    image:
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=300&q=80",
  },
];

export default function BuyForMeItemsScreen({
  market,
  currencySymbol = "₦",
  onBack = () => {},
  onContinue = () => {},
}: Props) {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ShoppingItem[]>(DEFAULT_ITEMS);
  const [requireReceipt, setRequireReceipt] = useState(true);
  const [showVehicleScreen, setShowVehicleScreen] = useState(false);

  // Add Item Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");

  const totalEstimatedPrice = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (Number(item.estimatedPrice) || 0) * (Number(item.quantity) || 0),
      0
    );
  }, [items]);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const price = parseFloat(newItemPrice) || 0;
    const qty = parseInt(newItemQty, 10) || 1;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: qty,
      estimatedPrice: price,
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80",
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemQty("1");
    setNewItemPrice("");
    setModalVisible(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  if (showVehicleScreen) {
  return (
    <BuyForMeVehicleScreen
      market={market!}
      items={items}
      onBack={() => setShowVehicleScreen(false)}
      onContinue={(vehicle) => {
        console.log("Selected vehicle:", vehicle);

        // Temporarily return to the shopping screen.
        // We'll connect the Review screen next.
        setShowVehicleScreen(false);
      }}
    />
  );
}

  return (
    <View style={{ paddingTop: insets?.top || 0 }} className="flex-1 bg-[#030712]">
      {/* HEADER WITH BACK & TITLE */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => onBack()}
          className="w-10 h-10 rounded-full bg-darkHeader border border-darkCard items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-white text-lg font-extrabold">Buy For Me</Text>
          <Text className="text-slate-400 text-xs font-semibold">
            {market?.name || "Selected Market"}
          </Text>
        </View>

        <View className="w-10" />
      </View>

      {/* 3-STEP PROGRESS STEPPER HEADER */}
      <View className="flex-row items-center justify-center px-6 py-2 mb-2">
        {/* STEP 1: VEHICLE */}
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
            <Text className="text-slate-400 text-xs font-bold">1</Text>
          </View>
          <Text className="text-slate-400 text-xs font-bold ml-1.5">
            Markert
          </Text>
        </View>

        <View className="w-8 h-[2px] bg-slate-800 mx-2" />

        {/* STEP 2: ITEMS (ACTIVE) */}
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-full bg-cyan-500 items-center justify-center shadow-md">
            <Text className="text-black text-xs font-extrabold">2</Text>
          </View>
          <Text className="text-cyan-400 text-xs font-extrabold ml-1.5">
            Items
          </Text>
        </View>

        <View className="w-8 h-[2px] bg-slate-800 mx-2" />

        {/* STEP 3: REVIEW (PENDING) */}
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
            <Text className="text-slate-400 text-xs font-bold">3</Text>
          </View>
          <Text className="text-slate-400 text-xs font-bold ml-1.5">
            Vehicle
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets?.bottom || 0) + 24 }}
      >
        {/* SHOPPING LIST TITLE & ADD ITEM TRIGGER */}
        <View className="flex-row justify-between items-center mb-3 mt-2">
          <Text className="text-white text-base font-extrabold">
            Shopping List
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center"
          >
            <Ionicons name="add" size={16} color="#00E5FF" />
            <Text className="text-cyan-400 text-xs font-bold ml-1">
              Add Item
            </Text>
          </TouchableOpacity>
        </View>

        {/* ITEM LIST */}
        <View className="gap-2.5 mb-5">
          {items.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between bg-[#090E1A] border border-darkCard rounded-[20px] p-3 shadow-sm"
            >
              {/* ITEM THUMBNAIL */}
              <View className="flex-row items-center flex-1 pr-2">
                <Image
                  source={{ uri: item.image }}
                  className="w-12 h-12 rounded-xl bg-slate-800"
                  resizeMode="cover"
                />
                <View className="ml-3 flex-1">
                  <Text
                    className="text-white text-sm font-bold"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    Est. {currencySymbol}
                    {Number(item.estimatedPrice || 0).toFixed(2)} each
                  </Text>
                </View>
              </View>

              {/* QUANTITY CONTROLS & PRICE */}
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 gap-2">
                  <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
                    <Ionicons name="remove-circle" size={18} color="#64748B" />
                  </TouchableOpacity>
                  <Text className="text-slate-300 text-xs font-bold">
                    x{item.quantity}
                  </Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
                    <Ionicons name="add-circle" size={18} color="#00E5FF" />
                  </TouchableOpacity>
                </View>

                <Text className="text-white text-sm font-extrabold min-w-[50px] text-right">
                  {currencySymbol}
                  {(Number(item.estimatedPrice || 0) * Number(item.quantity || 0)).toFixed(2)}
                </Text>

                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id)}
                  className="ml-1"
                >
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ESCROW & RECEIPT TOGGLE CARD */}
        <View className="bg-[#090E1A] border border-darkCard rounded-[20px] p-4 mb-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-1 pr-4">
            <Text className="text-white text-sm font-bold">
              Require Physical Receipts
            </Text>
            <Text className="text-slate-400 text-xs mt-1 leading-snug">
              Riders must upload photos of market receipts before escrow payouts
            </Text>
          </View>
          <Switch
            value={requireReceipt}
            onValueChange={setRequireReceipt}
            trackColor={{ false: "#1E293B", true: "#00E5FF" }}
            thumbColor={requireReceipt ? "#FFFFFF" : "#94A3B8"}
          />
        </View>

        {/* ESTIMATED FARE & BUDGET SUMMARY CARD */}
        <View className="bg-[#090E1A] border border-darkCard rounded-[20px] p-4 mb-6 flex-row items-center justify-between shadow-sm">
          <Text className="text-slate-300 text-sm font-bold">
            Estimated Fare ({currencySymbol === "₦" ? "NGN" : "USD"})
          </Text>
          <Text className="text-emerald-400 text-xl font-extrabold">
            {currencySymbol}
            {Number(totalEstimatedPrice || 0).toFixed(2)}
          </Text>
        </View>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
        onPress={() => {
            if (!market) {
            console.warn("Please select a market first.");
            return;
            }

            if (items.length === 0) {
            console.warn("Please add at least one shopping item.");
            return;
            }

            setShowVehicleScreen(true);
        }}
        activeOpacity={0.85}
        className="bg-brand py-4 rounded-[22px] items-center justify-center shadow-lg"
        >
          <Text className="text-white text-base font-extrabold">Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ADD NEW ITEM MODAL — KEYBOARD-AWARE */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent={false}
        onRequestClose={() => {
          Keyboard.dismiss();
          setModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View className="flex-1 bg-black/80 justify-end">
            <View
              className="bg-[#090E1A] border-t border-[#1E293B] rounded-t-[28px]"
              style={{ maxHeight: "90%", paddingBottom: Math.max(insets?.bottom || 0, 16) }}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-white text-base font-extrabold">
                    Add Custom Shopping Item
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setModalVisible(false);
                    }}
                    accessibilityLabel="Close add item"
                  >
                    <Ionicons name="close" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View className="gap-3 mb-5">
                  <View className="bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2.5">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
                      Item Name
                    </Text>
                    <TextInput
                      value={newItemName}
                      onChangeText={setNewItemName}
                      placeholder="e.g. Fresh Yam (Medium)"
                      placeholderTextColor="#64748B"
                      className="text-white text-sm font-semibold"
                      returnKeyType="next"
                      autoCorrect={false}
                    />
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2.5">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
                        Quantity
                      </Text>
                      <TextInput
                        value={newItemQty}
                        onChangeText={setNewItemQty}
                        keyboardType="number-pad"
                        placeholder="1"
                        placeholderTextColor="#64748B"
                        className="text-white text-sm font-semibold"
                      />
                    </View>

                    <View className="flex-1 bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2.5">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
                        Est. Price ({currencySymbol})
                      </Text>
                      <TextInput
                        value={newItemPrice}
                        onChangeText={setNewItemPrice}
                        keyboardType="decimal-pad"
                        placeholder="5000"
                        placeholderTextColor="#64748B"
                        className="text-white text-sm font-semibold"
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleAddItem}
                  className="bg-[#E11D48] py-3.5 rounded-xl items-center justify-center"
                  activeOpacity={0.85}
                >
                  <Text className="text-white font-extrabold text-sm">
                    Add to List
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}