import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { resetPassword } from '../services/authService';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

// Define the type of route parameters
type ResetPasswordScreenRouteProp = RouteProp<{ params: { token?: string } }, 'params'>;

const ResetPasswordScreen = () => {
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const navigation = useNavigation();
  
  // Use route.params?.token if available, otherwise default to an empty string
  const [code, setCode] = useState(route.params?.token || '');
  const [password, setPassword] = useState('');

    const handleResetPassword = async () => {
    try {
        await resetPassword(code, password);
        Alert.alert('Success', 'Your password has been reset.');
        navigation.navigate('Login');
    } catch (error) {
        // Cast 'error' to 'Error' type to safely access its properties
        const errorMessage = (error as Error).message || 'Failed to reset password.';
        Alert.alert('Error', errorMessage);
    }
    };


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter reset code"
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Reset Password" onPress={handleResetPassword} />
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
});

export default ResetPasswordScreen;
