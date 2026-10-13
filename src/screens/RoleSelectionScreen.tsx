import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";


interface RoleSelectionProps {
  onBack: () => void;
  phoneNumber: string;
  onCustomer: () => void;
  onRider: () => void;
}

export default function RoleSelectionScreen({
   onBack,
  phoneNumber,
  onCustomer,
  onRider,
}: RoleSelectionProps) {



  //Role selection 
const handleSelectRole = (role: 'CUSTOMER' | 'RIDER') => {
  if (role === 'CUSTOMER') {
    navigation.navigate('CustomerSignup', {
      role: 'CUSTOMER',
      phoneNumber: phoneNumber,
    });
  } else {
    navigation.navigate('RiderSignup', {
      role: 'RIDER',
      phoneNumber: phoneNumber,
    });
  }
};



  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >

      {/* HEADER */}
      <View className="relative h-28 items-center justify-center">

        {/* Back arrow */}
        <TouchableOpacity
          onPress={onBack}
          className="absolute left-5 top-8 w-12 h-12 items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            size={34}
            color="#001F3F"
          />
        </TouchableOpacity>

        {/* Logo */}
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/codaexpress-logo.png")}
            className="w-16 h-16"
            resizeMode="contain"
          />

          <Text className="text-dark text-3xl font-black">
            Coda
            <Text className="text-brand">Express</Text>
          </Text>
        </View>
      </View>


      {/* PAGE TITLE */}
      <View className="px-5 mt-8">

        <Text className="text-dark text-4xl font-black leading-tight">
          How will you use{"\n"}
          CodaExpress?
        </Text>

        <Text className="text-[#52779A] text-xl mt-5">
          Choose how you want to get started.
        </Text>

      </View>


      {/* CUSTOMER CARD */}
      <View className="mx-5  mt-10 border border-[#DCE7F0] rounded-3xl p-5">
           {/* Label */}
            <View className="self-center bg-[#FFE5EC] px-4 py-1 rounded-full">
              <Text className="text-brand text-xs font-black">
                CUSTOMER
              </Text>
            </View>


     
           {/* Customer top section */}
        <View className="flex-row">

          {/* IMAGE */}
          <View className="w-40 h-36 items-center justify-center">
            <Image
              source={require("../../assets/ccustomer.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

         
        <View>
          {/* TEXT */}
          <View className="flex-1">
            <Text className="  text-dark text-2xl font-black leading-tight mt-3">
              I want to send and{"\n"}
              receive deliveries
            </Text>
            {/* Customer features */}
          </View>
       
          <View className="flex-row items-center mt-6 mb-4">
            <Ionicons
              name="bag-handle"
              size={23}
              color="#52779A"
            />

            <Text className="text-[#52779A] text-base ml-4">
              Buy for me
            </Text>
          </View>


          <View className="flex-row items-center mb-4">
            <Ionicons
              name="location"
              size={23}
              color="#52779A"
            />

            <Text className="text-[#52779A] text-base ml-4">
              Pickup & drop-off
            </Text>
          </View>


          <View className="flex-row items-center mb-4">
            <Ionicons
              name="person"
              size={23}
              color="#52779A"
            />

            <Text className="text-[#52779A] text-base ml-4">
              Send a rider
            </Text>
          </View>


            <View className="flex-row items-center">
              <Ionicons
                name="time"
                size={23}
                color="#52779A"
              />

              <Text className="text-[#52779A] text-base ml-4">
                Track your orders
              </Text>
            </View>

   
        </View>
        
      </View>

        {/* CUSTOMER BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCustomer}
          className="bg-brand rounded-2xl py-4 mt-7 flex-row items-center justify-center"
        >

          <Text className="text-white text-lg font-bold">
            Continue as Customer
          </Text>

          <Ionicons
            name="arrow-forward"
            size={23}
            color="#FFFFFF"
            style={{ marginLeft: 10 }}
          />

        </TouchableOpacity>

      </View>


   {/* RIDER CARD */}
<View className="mx-5 mt-8 border border-[#DCE7F0] rounded-3xl p-5">

  {/* Label */}
  <View className="self-center bg-[#FFE5EC] px-4 py-1 rounded-full">
    <Text className="text-brand text-xs font-black">
      RIDER
    </Text>
  </View>


  {/* Rider top section */}
  <View className="flex-row">

    {/* IMAGE */}
    <View className="w-40 h-36 items-center justify-center">
      <Image
        source={require("../../assets/rrider.png")}
        className="w-full h-full"
        resizeMode="contain"
      />
    </View>


    {/* TEXT + FEATURES */}
    <View>

      {/* TEXT */}
      <View className="flex-1">
        <Text className="text-dark text-2xl font-black leading-tight mt-3">
          I want to deliver{"\n"}
          and earn
        </Text>
      </View>


      {/* Rider features */}

      <View className="flex-row items-center mt-6 mb-4">
        <Ionicons
          name="briefcase"
          size={23}
          color="#52779A"
        />

        <Text className="text-[#52779A] text-base ml-4">
          Accept delivery jobs
        </Text>
      </View>


      <View className="flex-row items-center mb-4">
        <Ionicons
          name="cart"
          size={23}
          color="#52779A"
        />

        <Text className="text-[#52779A] text-base ml-4">
          Shop for customers
        </Text>
      </View>


      <View className="flex-row items-center mb-4">
        <Ionicons
          name="cube"
          size={23}
          color="#52779A"
        />

        <Text className="text-[#52779A] text-base ml-4">
          Deliver packages
        </Text>
      </View>


      <View className="flex-row items-center">
        <Ionicons
          name="bar-chart"
          size={23}
          color="#52779A"
        />

        <Text className="text-[#52779A] text-base ml-4">
          Track your earnings
        </Text>
      </View>

    </View>

  </View>


  {/* RIDER BUTTON */}
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onRider}
    className="bg-brand rounded-2xl py-4 mt-7 flex-row items-center justify-center"
  >

    <Text className="text-white text-lg font-bold">
      Continue as Rider
    </Text>

    <Ionicons
      name="arrow-forward"
      size={23}
      color="#FFFFFF"
      style={{ marginLeft: 10 }}
    />

  </TouchableOpacity>

</View>

      {/* BOTTOM MESSAGE */}
      <View className="flex-row items-center justify-center mt-8 px-5">

        <Ionicons
          name="information-circle"
          size={18}
          color="#6685A3"
        />

        <Text className="text-[#6685A3] text-sm ml-2">
          You can change your account role later from your profile.
        </Text>

      </View>

    </ScrollView>
  );
}