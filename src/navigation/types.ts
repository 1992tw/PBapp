// types.ts
import { NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define all available screens and their params
export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string }; // `token` required here
  Home: undefined;
  Map: undefined;
  Weather: undefined;
  Messages: undefined;
  Register: undefined;
  EditEvent: { eventId: string };
  CreateEvent: undefined;
};

// Define the type of route parameters
type ResetPasswordScreenRouteProp = {
  token?: string;
};


// Type for generic navigation prop in RootStack
export type RootStackNavigationProp<T extends keyof RootStackParamList = keyof RootStackParamList> = NavigationProp<
  RootStackParamList,
  T
>;

// Specific navigation prop for HomeScreen
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Define navigation prop types for each screen
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
