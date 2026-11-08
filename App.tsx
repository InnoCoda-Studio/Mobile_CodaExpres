import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from '@react-navigation/native';
import "./global.css";

// Screens
import LoginScreen from './src/screens/LoginScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import CustomerSignupScreen from './src/screens/CustomerSignupScreen';
import RiderSignupScreen from './src/screens/RiderSignupScreen';
import Login from './src/screens/Login';
import RiderScreen1 from './src/screens/RiderScreen1';

import RiderInfo_1 from './src/RiderUnboading/RiderInfo_1';
import RiderInfo_2 from './src/RiderUnboading/RiderInfo_2';
import MotorcycleSection from './src/RiderUnboading/MotocycleSection';
import CarSection from './src/RiderUnboading/CarSection';
import EmergencyContact from './src/RiderUnboading/EmergencyContact';
import PayoutInformation from './src/RiderUnboading/PayoutInformation';
import ReviewApplication from './src/RiderUnboading/ReviewApplication';
import Approved from './src/RiderUnboading/Approved';
import UnderReview from './src/RiderUnboading/UnderReview';
import ApplicationSubmitted from './src/RiderUnboading/ApplicationSubmitted';
import NinVerification from './src/RiderUnboading/NinVerification';
import { updateRiderProfile } from './src/api/client';
import CustomerTabs from './src/CustormerScreen/Navigation/CustomerTabs';
import RiderHomeScreen from './src/RiderScreen/RiderHomeScreen';

// Forgot Password Flow Screens
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetOTPScreen from './src/screens/ResetOTPScreen';
import ResetPasswordConfirmScreen from './src/screens/ResetPasswordConfirmScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    | 'welcome'
    | 'login'
    | 'otp'
    | 'role'
    | 'customerSignup'
    | 'riderSignup'
    | 'Login'
    | 'customerHome'
    | 'RiderScreen1'
    | 'forgotPassword'
    | 'resetOtp'
    | 'resetConfirm'
    | 'onRiderInfo_1'
    | 'onRiderInfo_2'
    | "MotorcycleSection"
    | "CarSection"
    | 'EmergencyContact'
    | 'PayoutInformation'
    | 'ReviewApplication'
    | 'UnderReview'
    | 'Approved'
    | 'ApplicationSubmitted'
    | 'NinVerification'
    | 'CustomerTabs'
    | 'RiderHomeScreen'
  >('welcome');

  // Central state for all rider onboarding data
  const [riderData, setRiderData] = useState({
    firstName: '',
    lastName: '',
    phone_number: '',
    email: '',
    residential_address: '',
    nin_number: '',
    nin_cardUri: '',
    live_selfieUri: '',
    vehicle_type: 'BICYCLE',
    plate_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_color: '',
    emergency_full_name: '',
    emergency_phone_number: '',
    emergency_relationship: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  const updateRiderData = (fields: Partial<typeof riderData>) => {
    setRiderData((prev) => ({ ...prev, ...fields }));
  };

  // Registration state
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password Recovery states
  const [resetPhoneNumber, setResetPhoneNumber] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#030712" />

        {/* WELCOME */}
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => setCurrentScreen('customerHome')}
          />
        )}

        {/* PHONE SIGNUP / LOGIN LOOKUP */}
        {currentScreen === 'login' && (
          <LoginScreen
            onBack={() => setCurrentScreen('welcome')}
            onOtpSent={(phone) => {
              setPhoneNumber(phone); 
              setCurrentScreen('otp');
            }}
          />
        )}

        {/* REGISTRATION OTP VERIFICATION */}
        {currentScreen === 'otp' && (
          <VerifyOTPScreen
            phoneNumber={phoneNumber}
            onBack={() => setCurrentScreen('login')}
            onVerified={() => setCurrentScreen('role')}
          />
        )}

        {/* ROLE SELECTION */}
        {currentScreen === 'role' && (
          <RoleSelectionScreen
            phoneNumber={phoneNumber}
            onBack={() => setCurrentScreen('otp')}
            onCustomer={() => setCurrentScreen('customerSignup')}
            onRider={() => setCurrentScreen('riderSignup')}
          />
        )}

        {/* CUSTOMER SIGNUP */}
        {currentScreen === 'customerSignup' && (
          <CustomerSignupScreen
            phoneNumber={phoneNumber}
            onBack={() => setCurrentScreen('role')}
            onLogin={() => setCurrentScreen('Login')}
          />
        )}

        {/* RIDER SIGNUP */}
        {currentScreen === 'riderSignup' && (
          <RiderSignupScreen
            phoneNumber={phoneNumber}
            onBack={() => setCurrentScreen('role')}
            onLogin={() => setCurrentScreen('Login')}
            onSignupSuccess={(userDetails) => {
              updateRiderData({
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                email: userDetails.email,
                phone_number: phoneNumber,
              });
              setCurrentScreen('onRiderInfo_1');
            }}
          />
        )}

        {/* LOGIN */}
        {currentScreen === 'Login' && (
          <Login
            phoneNumber={phoneNumber}
            onBack={() => setCurrentScreen('role')}
            onSignUp={() => setCurrentScreen('role')}
            onForgotPassword={() => setCurrentScreen('forgotPassword')}
            onLogin={(role) => {
              if (role === 'RIDER') {
                setCurrentScreen('RiderScreen1');
              } else {
                setCurrentScreen('customerHome');
              }
            }}
          />
        )}

        {/* FORGOT PASSWORD - STEP 1 */}
        {currentScreen === 'forgotPassword' && (
          <ForgotPasswordScreen
            onBack={() => setCurrentScreen('Login')}
            onOtpSent={(ph, em) => {
              setResetPhoneNumber(ph);
              setResetEmail(em);
              setCurrentScreen('resetOtp');
            }}
          />
        )}

        {/* FORGOT PASSWORD - STEP 2 */}
        {currentScreen === 'resetOtp' && (
          <ResetOTPScreen
            phoneNumber={resetPhoneNumber}
            email={resetEmail}
            onBack={() => setCurrentScreen('forgotPassword')}
            onVerified={(code) => {
              setResetOtpCode(code);
              setCurrentScreen('resetConfirm');
            }}
          />
        )}

        {/* FORGOT PASSWORD - STEP 3 */}
        {currentScreen === 'resetConfirm' && (
          <ResetPasswordConfirmScreen
            identifier={resetPhoneNumber || resetEmail}
            otpCode={resetOtpCode}
            onBack={() => setCurrentScreen('resetOtp')}
            onSuccess={() => setCurrentScreen('Login')}
          />
        )}

        {/* CUSTOMER HOME / TABS */}
        {currentScreen === "customerHome" && <CustomerTabs />}

        {/* RIDER HOME */}
        {currentScreen === 'RiderScreen1' && (
          <RiderScreen1
            onRiderinfo_1={() => setCurrentScreen('onRiderInfo_1')}
          />
        )}

        {/* RIDER INFO STEP 1 */}
        {currentScreen === 'onRiderInfo_1' && (
          <RiderInfo_1
            firstName={riderData.firstName}
            lastName={riderData.lastName}
            phoneNumber={phoneNumber}
            email={riderData.email}
            onBack={() => setCurrentScreen('RiderScreen1')}
            onNext={(data) => {
              updateRiderData(data);
              setCurrentScreen('NinVerification');
            }}
          />
        )}

        {/* NIN VERIFICATION */}
        {currentScreen === 'NinVerification' && (
          <NinVerification
            onBack={() => setCurrentScreen('onRiderInfo_1')}
            onNext={(ninData) => {
              updateRiderData(ninData);
              setCurrentScreen('onRiderInfo_2');
            }}
          />
        )}

        {currentScreen === "onRiderInfo_2" && (
          <RiderInfo_2
            onBack={() => setCurrentScreen("onRiderInfo_1")}
            onNext={(vehicle) => {
              if (vehicle === "bicycle") {
                setCurrentScreen("EmergencyContact");
              } else if (vehicle === "motorcycle") {
                setCurrentScreen("MotorcycleSection");
              } else if (vehicle === "car") {
                setCurrentScreen("CarSection");
              }
            }}
          />
        )}

        {currentScreen === 'MotorcycleSection' && (
          <MotorcycleSection
            onBack={() => setCurrentScreen('onRiderInfo_2')}
            onNext={() => setCurrentScreen('EmergencyContact')}
          />
        )}

        {currentScreen === 'CarSection' && (
          <CarSection
            onBack={() => setCurrentScreen('onRiderInfo_2')}
            onNext={() => setCurrentScreen('EmergencyContact')}
          />
        )}

        {currentScreen === 'EmergencyContact' && (
          <EmergencyContact
            onBack={() => setCurrentScreen('onRiderInfo_2')}
            onNext={() => setCurrentScreen('PayoutInformation')}
          />
        )}

        {currentScreen === 'PayoutInformation' && (
          <PayoutInformation
            onBack={() => setCurrentScreen('onRiderInfo_2')}
            onNext={() => setCurrentScreen('ReviewApplication')}
          />
        )}
        
        {/* REVIEW APPLICATION & SUBMIT */}
        {currentScreen === "ReviewApplication" && (
          <ReviewApplication
            onBack={() => setCurrentScreen("PayoutInformation")}
            onEditPersonal={() => setCurrentScreen("onRiderInfo_1")}
            onEditIdentity={() => setCurrentScreen("NinVerification")}
            onEditVehicle={() => setCurrentScreen("onRiderInfo_2")}
            onEditDocuments={() => setCurrentScreen("NinVerification")}
            onEditEmergency={() => setCurrentScreen("EmergencyContact")}
            onEditPayout={() => setCurrentScreen("PayoutInformation")}
            onSubmit={async () => {
              try {
                console.log("Submitting rider profile to ...", riderData);
                await updateRiderProfile(riderData);
                setCurrentScreen("ApplicationSubmitted");
              } catch (error) {
                console.error("Failed to submit rider profile:", error);
              }
            }}
          />
        )}

        {currentScreen === 'ApplicationSubmitted' && (
          <ApplicationSubmitted 
            onNext={() => setCurrentScreen('UnderReview')}
          />
        )}

        {currentScreen === 'UnderReview' && (
          <UnderReview
            onBack={() => setCurrentScreen('ApplicationSubmitted')}
            onNext={() => setCurrentScreen('Approved')}
          />
        )}

        {currentScreen === 'Approved' && (
          <Approved 
            onNext={() => setCurrentScreen('RiderHomeScreen')}
          />
        )}

        {currentScreen === 'RiderHomeScreen' && (
          <RiderHomeScreen />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}