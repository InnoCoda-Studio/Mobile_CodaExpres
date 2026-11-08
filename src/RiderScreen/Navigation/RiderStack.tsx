import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RiderTabs from "./RiderTabs";
import ActiveOrderTrackerScreen from "../ActiveOrderTrackerScreen";

const Stack = createNativeStackNavigator();

export default function RiderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiderTabsMain" component={RiderTabs} />
      <Stack.Screen
        name="ActiveOrderTracker"
        component={ActiveOrderTrackerScreen}
        options={{ presentation: "fullScreenModal" }}
      />
    </Stack.Navigator>
  );
}