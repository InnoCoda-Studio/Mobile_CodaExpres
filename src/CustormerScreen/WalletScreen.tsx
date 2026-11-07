
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   StatusBar,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// type Props = {
//   currencySymbol?: string;
//   balance?: number;
// };

// type PaymentMethod = {
//   id: string;
//   name: string;
//   detail: string;
//   description: string;
//   iconName: keyof typeof Ionicons.glyphMap;
//   iconColor: string;
// };

// const PAYMENT_METHODS: PaymentMethod[] = [
//   {
//     id: "card",
//     name: "Debit / Credit Card",
//     detail: "•••• 4242",
//     description: "Deposit using Visa, MasterCard, or Verve.",
//     iconName: "card-outline",
//     iconColor: "#38BDF8",
//   },
//   {
//     id: "apple_pay",
//     name: "Apple Pay",
//     detail: "Connected",
//     description: "Fast and secure payment using Apple Wallet.",
//     iconName: "logo-apple",
//     iconColor: "#FFFFFF",
//   },
//   {
//     id: "google_pay",
//     name: "Google Pay",
//     detail: "Connected",
//     description: "Quick and secure checkout with Google Pay.",
//     iconName: "logo-google",
//     iconColor: "#FFFFFF",
//   },
//   {
//     id: "bank_transfer",
//     name: "Bank Transfer",
//     detail: "Wema Bank / Moniepoint",
//     description: "Transfer directly from your banking application.",
//     iconName: "business-outline",
//     iconColor: "#38BDF8",
//   },
//   {
//     id: "mobile_wallet",
//     name: "Mobile Wallet",
//     detail: "OPay / PalmPay",
//     description: "Fund your wallet using your mobile payment app.",
//     iconName: "wallet-outline",
//     iconColor: "#F59E0B",
//   },
// ];

// export default function WalletScreen({
//   currencySymbol = "₦",
//   balance = 0,
// }: Props) {
//   const insets = useSafeAreaInsets();

//   const [selectedMethodId, setSelectedMethodId] = useState("card");
//   const [modalVisible, setModalVisible] = useState(false);
//   const [activeMethod, setActiveMethod] = useState<PaymentMethod>(
//     PAYMENT_METHODS[0]
//   );
//   const [inputValue, setInputValue] = useState("");

//   const openPaymentModal = (method: PaymentMethod) => {
//     setSelectedMethodId(method.id);
//     setActiveMethod(method);
//     setInputValue("");
//     setModalVisible(true);
//   };

//   const closePaymentModal = () => {
//     setModalVisible(false);
//     setInputValue("");
//   };

//   const handleConfirm = () => {
//     if (activeMethod.id === "card") {
//       const amount = Number(inputValue);

//       if (
//         !inputValue.trim() ||
//         !Number.isFinite(amount) ||
//         amount <= 0
//       ) {
//         return;
//       }
//     }

//     // Connect this action to your payment backend later.
//     console.log("Payment method:", activeMethod.id);
//     console.log("Payment input:", inputValue);

//     closePaymentModal();
//   };

//   return (
//     <View className="flex-1 bg-darkBg" style={{ paddingTop: insets.top }}>
//       <StatusBar barStyle="light-content" backgroundColor="#090D16" />

//       {/* HEADER */}
//       <View className="border-b border-darkBorder bg-darkHeader px-5 py-5">
//         <Text className="text-xl font-black tracking-tight text-white">
//           Wallet & Payments
//         </Text>

//         <Text className="mt-1 text-xs text-slate-400">
//           Manage your CodaExpress wallet
//         </Text>
//       </View>

//       <ScrollView
//         className="flex-1 px-4 pt-5"
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         contentContainerStyle={{ paddingBottom: 35 }}
//       >
//         {/* BALANCE CARD */}
//         <View className="mb-5 flex-row items-center justify-between rounded-3xl border border-darkBorder bg-darkCard p-5">
//           <View>
//             <Text className="text-3xl font-black text-white">
//               {currencySymbol}
//               {balance.toLocaleString("en-NG", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </Text>

//             <Text className="mt-1 text-xs font-semibold text-slate-400">
//               Available Balance
//             </Text>
//           </View>

//           <TouchableOpacity
//             onPress={() => openPaymentModal(PAYMENT_METHODS[0])}
//             activeOpacity={0.85}
//             className="flex-row items-center rounded-2xl bg-brand px-5 py-3.5"
//           >
//             <Ionicons name="add" size={19} color="#FFFFFF" />

//             <Text className="ml-1 text-sm font-black text-white">
//               Top Up
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* QUICK ACTIONS */}
//         <View className="mb-7 flex-row gap-3">
//           <QuickAction
//             icon="wallet-outline"
//             label="Add Money"
//             color="#0284C7"
//             onPress={() => openPaymentModal(PAYMENT_METHODS[0])}
//           />

//           <QuickAction
//             icon="arrow-down-circle-outline"
//             label="Withdraw"
//             color="#10B981"
//             onPress={() => console.log("Withdraw pressed")}
//           />

//           <QuickAction
//             icon="time-outline"
//             label="History"
//             color="#F59E0B"
//             onPress={() => console.log("History pressed")}
//           />
//         </View>

//         {/* PAYMENT METHODS */}
//         <View className="mb-4 flex-row items-center justify-between">
//           <Text className="text-base font-black text-white">
//             Payment Methods
//           </Text>

//           <Text className="text-xs font-semibold text-slate-400">
//             Tap to configure
//           </Text>
//         </View>

//         <View className="gap-3">
//           {PAYMENT_METHODS.map((method) => {
//             const isSelected = selectedMethodId === method.id;

//             return (
//               <TouchableOpacity
//                 key={method.id}
//                 activeOpacity={0.85}
//                 onPress={() => openPaymentModal(method)}
//                 className={`flex-row items-center justify-between rounded-3xl border p-4 ${
//                   isSelected
//                     ? "border-rider bg-darkHeader"
//                     : "border-darkBorder bg-darkCard"
//                 }`}
//               >
//                 <View className="flex-1 flex-row items-center gap-3">
//                   <View
//                     className={`h-12 w-12 items-center justify-center rounded-2xl border ${
//                       isSelected
//                         ? "border-rider bg-rider/20"
//                         : "border-darkBorder bg-darkHeader"
//                     }`}
//                   >
//                     <Ionicons
//                       name={method.iconName}
//                       size={22}
//                       color={method.iconColor}
//                     />
//                   </View>

//                   <View className="flex-1">
//                     <Text className="text-sm font-extrabold text-white">
//                       {method.name}
//                     </Text>

//                     <Text className="mt-1 text-xs font-semibold text-slate-400">
//                       {method.detail}
//                     </Text>
//                   </View>
//                 </View>

//                 <View
//                   className={`h-6 w-6 items-center justify-center rounded-full border ${
//                     isSelected
//                       ? "border-rider bg-rider"
//                       : "border-slate-600 bg-darkHeader"
//                   }`}
//                 >
//                   {isSelected && (
//                     <View className="h-2.5 w-2.5 rounded-full bg-white" />
//                   )}
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </ScrollView>

//       {/* PAYMENT MODAL */}
//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="slide"
//         statusBarTranslucent
//         onRequestClose={closePaymentModal}
//       >
//         <KeyboardAvoidingView
//           className="flex-1"
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//         >
//           <View className="flex-1 justify-end bg-black/80">
//             <View
//               className="rounded-t-3xl border-t border-darkBorder bg-darkCard px-6 pt-6"
//               style={{
//                 paddingBottom: Math.max(insets.bottom, 24),
//               }}
//             >
//               {/* MODAL HEADER */}
//               <View className="mb-4 flex-row items-center justify-between">
//                 <View className="flex-row items-center gap-3">
//                   <View className="h-11 w-11 items-center justify-center rounded-xl border border-rider bg-darkHeader">
//                     <Ionicons
//                       name={activeMethod.iconName}
//                       size={21}
//                       color={activeMethod.iconColor}
//                     />
//                   </View>

//                   <Text className="text-base font-black text-white">
//                     {activeMethod.name}
//                   </Text>
//                 </View>

//                 <TouchableOpacity
//                   onPress={closePaymentModal}
//                   className="h-9 w-9 items-center justify-center rounded-full border border-darkBorder bg-darkHeader"
//                 >
//                   <Ionicons name="close" size={19} color="#FFFFFF" />
//                 </TouchableOpacity>
//               </View>

//               <Text className="mb-5 text-xs leading-5 text-slate-300">
//                 {activeMethod.description}
//               </Text>

//               {/* INPUT */}
//               <View className="mb-5 rounded-2xl border border-darkBorder bg-darkHeader px-4 py-3">
//                 <Text className="mb-2 text-[10px] font-bold uppercase text-slate-400">
//                   {activeMethod.id === "card"
//                     ? `Enter Deposit Amount (${currencySymbol})`
//                     : "Reference / Note (Optional)"}
//                 </Text>

//                 <TextInput
//                   value={inputValue}
//                   onChangeText={setInputValue}
//                   placeholder={
//                     activeMethod.id === "card"
//                       ? "e.g. 5000"
//                       : "Enter a reference or note"
//                   }
//                   placeholderTextColor="#64748B"
//                   keyboardType={
//                     activeMethod.id === "card"
//                       ? "decimal-pad"
//                       : "default"
//                   }
//                   className="py-2 text-sm font-semibold text-white"
//                 />
//               </View>

//               {/* CONFIRM */}
//               <TouchableOpacity
//                 onPress={handleConfirm}
//                 activeOpacity={0.85}
//                 className="items-center justify-center rounded-2xl bg-brand py-4"
//               >
//                 <Text className="text-base font-black text-white">
//                   Confirm & Fund Wallet
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={closePaymentModal}
//                 className="mt-3 items-center py-3"
//               >
//                 <Text className="text-sm font-semibold text-slate-400">
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </View>
//   );
// }

// function QuickAction({
//   icon,
//   label,
//   color,
//   onPress,
// }: {
//   icon: keyof typeof Ionicons.glyphMap;
//   label: string;
//   color: string;
//   onPress: () => void;
// }) {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       activeOpacity={0.8}
//       className="flex-1 items-center justify-center rounded-3xl border border-darkBorder bg-darkCard py-4"
//     >
//       <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl border border-darkBorder bg-darkHeader">
//         <Ionicons name={icon} size={21} color={color} />
//       </View>

//       <Text className="text-[11px] font-bold text-white">
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }
