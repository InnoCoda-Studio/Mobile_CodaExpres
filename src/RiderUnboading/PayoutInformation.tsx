import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/client"; // Adjust path to your axios instance

interface PayoutInformationProps {
  onBack: () => void;
  onNext: () => void;
}

interface BankItem {
  name: string;
  code: string;
  country: string;
}

// Official Paystack Nigerian & International Bank Codes
const INTERNATIONAL_BANKS: BankItem[] = [
  { name: "OPay", code: "999992", country: "NG" },
  { name: "Moniepoint Microfinance Bank", code: "50515", country: "NG" },
  { name: "PalmPay", code: "999991", country: "NG" },
  { name: "Kuda Bank", code: "50211", country: "NG" },
  { name: "GTBank (Guaranty Trust Bank)", code: "058", country: "NG" },
  { name: "Access Bank", code: "044", country: "NG" },
  { name: "Zenith Bank", code: "057", country: "NG" },
  { name: "First Bank of Nigeria", code: "011", country: "NG" },
  { name: "United Bank for Africa (UBA)", code: "033", country: "NG" },
  { name: "Fidelity Bank", code: "070", country: "NG" },
  { name: "Stanbic IBTC Bank", code: "221", country: "NG" },
  { name: "Wema Bank / ALAT", code: "035", country: "NG" },
];

export default function PayoutInformation({
  onBack,
  onNext,
}: PayoutInformationProps) {
  const [selectedBank, setSelectedBank] = useState<BankItem | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");

  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved draft on mount
  useEffect(() => {
    (async () => {
      try {
        const savedBankName = await AsyncStorage.getItem("draft_bank_name");
        const savedAccount = await AsyncStorage.getItem("draft_account_number");
        const savedName = await AsyncStorage.getItem("draft_account_name");

        if (savedBankName) {
          const matchedBank = INTERNATIONAL_BANKS.find((b) => b.name === savedBankName);
          if (matchedBank) setSelectedBank(matchedBank);
        }
        if (savedAccount) setAccountNumber(savedAccount);
        if (savedName) {
          setAccountName(savedName);
          setIsAccountVerified(true);
        }
      } catch (e) {
        console.error("Failed to load payout draft", e);
      }
    })();
  }, []);

  // Real-time account verification helper
  const verifyAccountRealtime = async (num: string, bank: BankItem) => {
    if (num.length !== 10) return;

    setIsResolvingAccount(true);
    setErrorMessage("");

    try {
      const res = await axiosInstance.post("/auth/verify-bank-account/", {
        account_number: num,
        bank_code: bank.code,
      });

      if (res.data?.account_name) {
        setAccountName(res.data.account_name);
        setIsAccountVerified(true);
        await AsyncStorage.setItem("draft_account_name", res.data.account_name);
      }
    } catch (err: any) {
      console.error("Account verification error:", err);
      setIsAccountVerified(false);
      const apiMsg = err.response?.data?.error || "Could not verify account details. Please check the account number.";
      setErrorMessage(apiMsg);
    } finally {
      setIsResolvingAccount(false);
    }
  };

  const handleAccountNumChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setAccountNumber(cleaned);
    setIsAccountVerified(false);
    AsyncStorage.setItem("draft_account_number", cleaned).catch(() => {});

    if (cleaned.length === 10 && selectedBank) {
      verifyAccountRealtime(cleaned, selectedBank);
    }
  };

  const handleSelectBank = (bank: BankItem) => {
    setSelectedBank(bank);
    setIsBankModalOpen(false);
    setBankSearchQuery("");
    AsyncStorage.setItem("draft_bank_name", bank.name).catch(() => {});

    if (accountNumber.length === 10) {
      verifyAccountRealtime(accountNumber, bank);
    }
  };

  const filteredBanks = INTERNATIONAL_BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  const handleContinue = async () => {
    if (!selectedBank) {
      setErrorMessage("Please select your bank.");
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit account number.");
      return;
    }
    if (!accountName.trim()) {
      setErrorMessage("Account name could not be verified in real time.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const payload = {
      bank_name: selectedBank.name,
      account_number: accountNumber.trim(),
      account_name: accountName.trim(),
    };

    try {
      await axiosInstance.patch("/auth/riders/onboarding/", payload);

      await AsyncStorage.multiRemove([
        "draft_bank_name",
        "draft_account_number",
        "draft_account_name",
      ]);

      onNext();
    } catch (error: any) {
      console.error("Payout Info Error:", error);
      const apiMsg = error.response?.data?.error || error.response?.data?.detail;
      setErrorMessage(apiMsg || "Failed to save bank payout details. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FCFE]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-5">
          {/* HEADER */}
          <View className="h-[85px] flex-row items-center justify-center relative">
            <TouchableOpacity
              onPress={onBack}
              className="absolute left-[-8px] top-5 w-12 h-12 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={28} color="#001F3F" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <Image
                source={require("../../assets/codaexpress-logo.png")}
                className="w-[38px] h-[38px]"
                resizeMode="contain"
              />
              <Text className="text-[#001F3F] text-[19px] font-extrabold ml-1">
                Coda<Text className="text-[#FF4D6D]">Express</Text>
              </Text>
            </View>
          </View>

          {/* PROGRESS DOT */}
          <View className="items-center mb-6">
            <View className="w-[8px] h-[8px] rounded-full bg-[#00C2D1]" />
          </View>

          {/* CONTENT */}
          <View>
            <Text className="text-[#001F3F] text-[21px] font-black">
              Payout Information
            </Text>

            <Text className="text-[#91A9C1] text-[15px] leading-[23px] font-medium mt-1 mb-6">
              How would you like to receive your earnings?
            </Text>

            {errorMessage ? (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-xs font-medium">{errorMessage}</Text>
              </View>
            ) : null}

            {/* BANK SELECTOR */}
            <Text className="text-[#66829B] text-[13px] font-medium mb-1">
              Bank / Financial Institution <Text className="text-[#FF4D6D]">*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsBankModalOpen(true)}
              className="h-[48px] w-full bg-white border border-[#DCEAF2] rounded-[8px] flex-row items-center justify-between px-3 mb-5"
            >
              <Text className={`text-[14px] ${!selectedBank ? "text-[#91A9C1]" : "text-[#001F3F] font-semibold"}`}>
                {selectedBank ? selectedBank.name : "Select bank"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#4F7188" />
            </TouchableOpacity>

            {/* ACCOUNT NUMBER */}
            <Text className="text-[#66829B] text-[13px] font-medium mb-1">
              Account Number <Text className="text-[#FF4D6D]">*</Text>
            </Text>
            <View className="h-[48px] w-full bg-white border border-[#DCEAF2] rounded-[8px] flex-row items-center px-3 mb-5">
              <TextInput
                value={accountNumber}
                onChangeText={handleAccountNumChange}
                placeholder="Enter 10-digit account number"
                placeholderTextColor="#91A9C1"
                keyboardType="numeric"
                maxLength={10}
                className="flex-1 text-[14px] text-[#001F3F] font-bold tracking-wider"
              />
              {isResolvingAccount && (
                <ActivityIndicator size="small" color="#00C2D1" />
              )}
            </View>

            {/* AUTOMATICALLY RESOLVED ACCOUNT NAME */}
            <Text className="text-[#66829B] text-[13px] font-medium mb-1">
              Account Holder Name
            </Text>
            <View className="h-[48px] w-full bg-[#F0F5F8] border border-[#DCEAF2] rounded-[8px] justify-center px-3 mb-6">
              <Text className={`text-[14px] ${accountName ? "text-[#001F3F] font-bold" : "text-[#91A9C1]"}`}>
                {accountName || "Account name will auto-resolve"}
              </Text>
            </View>

            {/* REAL-TIME VERIFICATION BADGE */}
            {isAccountVerified && (
              <View className="min-h-[60px] w-full rounded-[9px] border border-[#B5EFE0] bg-[#F0FFFB] px-4 py-3 flex-row items-center">
                <View className="w-[22px] h-[22px] rounded-full bg-[#20C878] items-center justify-center mr-3">
                  <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#20A86B] text-[13px] font-bold">
                    Account Verified in Real Time
                  </Text>
                  <Text className="text-[#20A86B] text-[11px] font-medium mt-0.5">
                    Match confirmed with financial institution.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* CONTINUE BUTTON */}
          <View className="flex-1 justify-end pb-7 mt-8">
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isSubmitting || isResolvingAccount}
              activeOpacity={0.8}
              className="h-[52px] w-full rounded-[9px] bg-[#00C2D1] items-center justify-center flex-row"
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-white text-[15px] font-bold ml-2">Saving Setup...</Text>
                </View>
              ) : (
                <>
                  <Text className="text-white text-[15px] font-bold">Submit Payout Setup</Text>
                  <Ionicons name="arrow-forward" size={19} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* SEARCHABLE BANK SELECTOR MODAL */}
      <Modal
        visible={isBankModalOpen}
        animationType="slide"
        onRequestClose={() => setIsBankModalOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-[#F8FCFE]">
          <View className="p-4 flex-row items-center justify-between border-b border-[#E1EEF4]">
            <Text className="text-[18px] font-extrabold text-[#001F3F]">Select Bank</Text>
            <TouchableOpacity onPress={() => setIsBankModalOpen(false)}>
              <Ionicons name="close" size={26} color="#001F3F" />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <View className="h-[46px] w-full bg-white border border-[#DCEAF2] rounded-[8px] flex-row items-center px-3">
              <Ionicons name="search" size={20} color="#91A9C1" className="mr-2" />
              <TextInput
                value={bankSearchQuery}
                onChangeText={setBankSearchQuery}
                placeholder="Search bank name..."
                placeholderTextColor="#91A9C1"
                className="flex-1 text-[14px] text-[#001F3F]"
              />
            </View>
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectBank(item)}
                className="py-3.5 px-5 border-b border-[#F0F5F8] flex-row items-center justify-between"
              >
                <Text className="text-[15px] text-[#001F3F] font-medium">{item.name}</Text>
                {selectedBank?.code === item.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#00C2D1" />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}