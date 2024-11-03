// ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { forgotPassword } from '../services/authService'; // You'll need to create this function
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types'; // Import your navigation type

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RootStackNavigationProp>(); // Use the type here

const handleForgotPassword = async () => {
  if (!email) {
    Alert.alert('Error', 'Please enter your email.');
    return;
  }

  setLoading(true);
  try {
    await forgotPassword(email);
    Alert.alert('Success', 'Check your email for a reset link.');
    navigation.navigate({
  name: 'ResetPassword',
  params: { token: '' }, 
});
 // Navigate to the reset screen
  } catch (error) {
    Alert.alert('Error', (error as Error).message || 'Failed to send email.');
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#A9A9A9"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Send Reset Link" onPress={handleForgotPassword} disabled={loading} />
      <View style={styles.loginContainer}>
        <Text>Remember your password? </Text>
        <Button title="Login" onPress={() => navigation.navigate('Login')} /> {/* Correct usage */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  loginContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});

export default ForgotPasswordScreen;
