import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onBack?: () => void;
};

interface Transaction {
  id: string;
  type: "top_up" | "commission_deduction";
  amount: number;
  description: string;
  date: string;
}

const initialTransactions: Transaction[] = [
  {
    id: "TX-9901",
    type: "top_up",
    amount: 5000,
    description: "Instant Bank Transfer Top-Up",
    date: "Today, 10:30 AM",
  },
  {
    id: "TX-9899",
    type: "commission_deduction",
    amount: 250,
    description: "Commission deduction (Order #CDX-94821)",
    date: "Today, 11:15 AM",
  },
  {
    id: "TX-9820",
    type: "commission_deduction",
    amount: 180,
    description: "Commission deduction (Order #CDX-94102)",
    date: "Yesterday, 4:45 PM",
  },
];

export default function WalletScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  const [walletBalance, setWalletBalance] = useState(4570);
  const [topUpModal, setTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("2000");
  const [copied, setCopied] = useState(false);

  const virtualAccount = "9012345678";

  const handleCopyAccount = () => {
    Clipboard.setString(virtualAccount);
    setCopied(true);
    Alert.alert("Copied!", "Virtual account number copied to clipboard.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmTopUp = () => {
    const amount = parseInt(topUpAmount, 10);
    if (!amount || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    setWalletBalance((prev) => prev + amount);
    setTopUpModal(false);
    Alert.alert("Top-Up Successful", `Added ₦${amount.toLocaleString()} to your rider wallet.`);
  };

  return (
    <View className="flex-1 bg-[#06090F]" style={{ paddingTop: insets.top }}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-[#090D16] border-b border-slate-800">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-2xl bg-[#111B2A] border border-slate-800 items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-black">Rider Prepaid Wallet</Text>

        <View className="w-10 h-10 rounded-2xl bg-[#E11D48]/10 border border-[#E11D48]/30 items-center justify-center">
          <Ionicons name="wallet-outline" size={20} color="#E11D48" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* MAIN WALLET CARD */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-3xl p-5 shadow-2xl mb-5">
          <Text className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1">
            Active Wallet Balance
          </Text>
          <Text className="text-white text-3xl font-black mb-4">
            ₦{walletBalance.toLocaleString()}
          </Text>

          <View className="bg-[#090D16] border border-slate-800/80 p-3.5 rounded-2xl mb-4 flex-row items-center gap-3">
            <Ionicons name="information-circle-outline" size={20} color="#38BDF8" />
            <Text className="text-slate-400 text-xs flex-1">
              Customers pay you directly in cash or transfer. Platform fees are deducted from this balance.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setTopUpModal(true)}
            className="bg-[#E11D48] py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-black text-sm">Top Up Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* INSTANT BANK TRANSFER DEPOSIT DETAILS */}
        <View className="bg-[#111B2A] border border-slate-800 rounded-3xl p-5 mb-5">
          <Text className="text-white text-sm font-extrabold mb-1">Instant Bank Deposit Account</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Transfer money directly to your dedicated virtual account to top up instantly.
          </Text>

          <View className="bg-[#090D16] border border-slate-800 p-4 rounded-2xl flex-row items-center justify-between">
            <View>
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Moniepoint Microfinance</Text>
              <Text className="text-white text-lg font-black tracking-widest mt-0.5">{virtualAccount}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">CodaExpress Rider Wallet</Text>
            </View>

            <TouchableOpacity
              onPress={handleCopyAccount}
              className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-emerald-400 text-xs font-bold">
                {copied ? "Copied" : "Copy"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TRANSACTION HISTORY */}
        <Text className="text-white text-sm font-extrabold uppercase tracking-wider mb-3">
          Wallet Transactions
        </Text>

        {initialTransactions.map((tx) => (
          <View
            key={tx.id}
            className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1 mr-2">
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  tx.type === "top_up"
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : "bg-rose-500/10 border border-rose-500/30"
                }`}
              >
                <Ionicons
                  name={tx.type === "top_up" ? "arrow-down" : "arrow-up"}
                  size={18}
                  color={tx.type === "top_up" ? "#34D399" : "#FB7185"}
                />
              </View>

              <View className="flex-1">
                <Text className="text-white text-xs font-bold" numberOfLines={1}>
                  {tx.description}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">{tx.date}</Text>
              </View>
            </View>

            <Text
              className={`text-xs font-black ${
                tx.type === "top_up" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {tx.type === "top_up" ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* MANUAL TOP-UP MODAL */}
      <Modal visible={topUpModal} animationType="slide" transparent onRequestClose={() => setTopUpModal(false)}>
        <View className="flex-1 bg-[#030712CC] justify-end">
          <View
            className="bg-[#090D16] rounded-t-[32px] border-t border-slate-800 p-5 shadow-2xl"
            style={{ paddingBottom: Math.max(insets.bottom + 10, 20) }}
          >
            <View className="w-12 h-1.5 rounded-full bg-slate-700 self-center mb-4" />

            <Text className="text-white text-lg font-black mb-1">Top Up Balance</Text>
            <Text className="text-slate-400 text-xs mb-4">Select or enter an amount to fund your rider wallet.</Text>

            <View className="bg-[#111B2A] border border-slate-800 rounded-2xl p-4 mb-4">
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Amount (₦)</Text>
              <TextInput
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
                className="text-white text-2xl font-black"
              />
            </View>

            {/* QUICK AMOUNTS */}
            <View className="flex-row gap-2 mb-5">
              {["1000", "2000", "5000", "10000"].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setTopUpAmount(amt)}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    topUpAmount === amt
                      ? "bg-[#E11D48]/20 border-[#E11D48]"
                      : "bg-[#111B2A] border-slate-800"
                  }`}
                >
                  <Text className="text-white text-xs font-bold">₦{parseInt(amt).toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setTopUpModal(false)}
                className="flex-1 bg-slate-900 border border-slate-800 py-3.5 rounded-2xl items-center"
              >
                <Text className="text-slate-400 font-bold text-xs">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmTopUp}
                className="flex-1 bg-[#E11D48] py-3.5 rounded-2xl items-center shadow-lg"
              >
                <Text className="text-white font-black text-xs">Confirm Top-Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}